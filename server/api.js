const express = require('express');
const { exec, execSync } = require('child_process');
const fs = require('fs');
const nodemailer = require("nodemailer");
const { ResetModel } = require('./db.js');

const router = express.Router();
const transporter = nodemailer.createTransport({host: "127.0.0.1", port: 25});

const aliasdir = '/SPARCS/mail/aliases.d/';
const aliasfile = '/etc/aliases';
const homedir = '/home/';
const adminPasswordFile = '/admin_password'
const resetLength = 50;
const resetTime = 1200;

const nuid = parseInt(execSync('id -u nobody', { shell: '/bin/sh' }));

function escape(str) {
  return str
    .replace(/\\/gi, '\\\\')
    .replace(/\"/gi, '\\\"')
    .replace(/\$/gi, '\\$');
}

router.post('/login', (req, res) => {
  let _un = req.body.un;
  let un = escape(_un);
  let pw = escape(req.body.pw);
  let succ = { result: true };
  let fail = { result: false };
  if (un && pw) {
    exec(`ldapwhoami -H ldap://ldap.sparcs.org -D "uid=${un},ou=People,dc=sparcs,dc=org" -w "${pw}"`,
	  { shell: '/bin/sh', uid: nuid }, (error, stdout, stderr) => {
      if (error || stdout.length === 0 || stderr.length !== 0) res.json(fail);
      else {
        req.session.un = _un;
        res.json(succ);
      }
    });
  } else res.json(fail)
});

router.post('/passwd', (req, res) => {
  let un = escape(req.session.un);
  let opass = escape(req.body.opass);
  let npass = escape(req.body.npass);
  let succ = { result: true };
  let fail = { result: false };
  if (un && opass && npass) {
    exec(`ldappasswd -H ldap://ldap.sparcs.org -D "uid=${un},ou=People,dc=sparcs,dc=org" -S -w "${opass}" -s "${npass}"`,
      { shell: '/bin/sh', uid: nuid }, (error, stdout, stderr) => {
      if (error || stdout.length !== 0 || stderr.length !== 0) res.json(fail);
      else res.json(succ);
    });
  } else res.json(fail);
});

router.post('/create', (req, res) => {
  let un = req.session.un;
  let m = req.body.name;
  if (fs.existsSync(aliasdir + m)) {
    res.json({ result: false });
  } else {
    let info = (new Date()).toISOString().substring(0, 10) + ', by ' + un + ', ' + req.body.desc;
    fs.writeFile(aliasdir + m + '.info', info, {flag: 'w'}, err => {
      fs.writeFile(aliasdir + m + '.template', 'mail-archive\n\n' + un, {flag: 'w'}, err => {
        fs.writeFile(aliasfile, `${m}: :include:${aliasdir}${m}`, {flag: 'as'}, err => {
          fs.writeFile(aliasdir + m, 'mail-archive\n\n' + un, {flag: 'w'}, err => {
            res.json({ result: true });
          });
        });
      });
    });
  }
});

router.get('/forward', (req, res) => {
  let path = homedir + req.session.un + '/.forward'
  fs.stat(path, (err, stats) => {
    if (err) res.json({ mail: '' });
    else fs.readFile(path, (err, buf) => {
      if (err) res.json({ mail: '' });
      else res.json({ mail: buf.toString() });
    });
  });
});

router.post('/forward', (req, res) => {
  let mail = req.body.mail;
  let path = homedir + req.session.un + '/.forward'
  fs.writeFile(path, mail, {flag: 'w'}, err => {
    if (err) res.json({ result: false });
    else res.json({ result: true });
  });
});

router.get('/edalias', (req, res) => {
  let un = req.session.un;
  fs.readdir(aliasdir, (err, files) => {
    let all = files.filter(f => {
      return f.endsWith('.template');
    }).map(f => {
      return f.replace('.template', '');
    });
    let info = {};
    all.forEach(f => {
      let path = aliasdir + f + '.info';
      if (fs.existsSync(path)) info[f] = fs.readFileSync(path).toString();
    });
    let aliases = all.filter(f => {
      return fs.readFileSync(aliasdir + f).toString().split('\n').includes(un);
    });
    res.json({ all: all, info: info, aliases: aliases });
  })
});

router.post('/edalias', (req, res) => {
  let un = req.session.un;
  req.body.added.forEach(m => {
    fs.writeFileSync(aliasdir + m, '\n' + un, {flag: 'as'});
  });
  req.body.removed.forEach(m => {
    let uns = fs.readFileSync(aliasdir + m).toString().split('\n');
    uns.splice(uns.indexOf(un));
    fs.writeFileSync(aliasdir + m, uns.join('\n'), {flag: 'w'});
  });
  res.json({ result: true });
});

router.post('/reset', (req, res) => {
  let un = req.body.un;
  if (un) {
    ResetModel.findOne({ un: un }, (err, _reset) => {
	  if (!_reset || Date.now() - _reset.date > resetTime * 1000) {
	    ResetModel.deleteOne({ un: un }, err => {});
        let reset = new ResetModel();
	    reset.un = un;
	    let link = "https://edalias.sparcs.org/reset/" + reset.serial;
        let mail = {
	      to: un + "@localhost",
	      subject: "old.sparcs.org Password Reset",
	      text: link,
	      html: "<a href=\"" + link + "\">Reset password</a>"
	    };
        transporter.sendMail(mail);
	    reset.save();
	  }
    });
  }
  res.end();
});

router.post('/reset/:serial', (req, res) => {
  let serial = req.params.serial;
  ResetModel.findOne({ serial: serial }, (err, reset) => {
    if (!reset)
      res.json({ result: false });
	else {
      if (Date.now() - reset.date > resetTime * 1000)
        res.json({ result: false });
	  else {
        let npass = escape(req.body.npass);
        let apass = escape(fs.readFileSync(adminPasswordFile).toString().trim());
		exec(`ldappasswd -H ldap://ldap.sparcs.org -D "cn=admin,dc=sparcs,dc=org" -S -w "${apass}" "uid=${reset.un},ou=People,dc=sparcs,dc=org" -s "${npass}"`,
	      { shell: '/bin/sh', uid: nuid }, (error, stdout, stderr) => {
          if (error) res.json({ result: true, succ: false });
          else if (stdout.length === 0 && stderr.length === 0) res.json({ result: true, succ: true });
          else res.json({ result: true, succ: false });
        });
	  }
	  ResetModel.deleteOne({ serial: serial }, err => {});
	}
  });
});

module.exports = router;
