const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const fs = require('fs');
const nodemailer = require("nodemailer");
const { exec, execSync } = require('child_process');

const { initDB, ResetModel, mysqlQuery } = require('./db.js');
const { log, logError } = require('./log.js');

const { secure, maxAge,
  aliasDir, aliasFile, homeDir, resetTime, resetLink,
  mailHost, mailPort, mailTo, mailSubject, ldapHost } = require('../config/config.js');
const { secret, adminPassword } = require('../config/local_config.js');

const router = express.Router();
const transporter = nodemailer.createTransport({host: mailHost, port: mailPort});
const nuid = parseInt(execSync('id -u nobody', { shell: '/bin/sh' }));

function writeLog(req, res, next) {
  log(req);
  next();
}

function escape(str) {
  return str
    .replace(/\\/gi, '\\\\')
    .replace(/"/gi, '\\"')
    .replace(/\$/gi, '\\$');
}

function checkPassword(pw, un) {
  return pw && un && pw.length >= 8 && !pw.toLowerCase().includes(un.toLowerCase());
}

function checkAuth(req, res, next) {
  let un = req.session.un;
  let url = req.url;
  if (url.endsWith('/')) url = url.substring(0, url.length - 1);
  if (url !== '/login' && !url.startsWith('/reset') && un === undefined)
    res.json({ expired: true });
  else if (url.startsWith('/wheel') && un !== 'wheel')
    res.json({ expired: true });
  else
    next();
}

initDB();
router.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: secure, maxAge: maxAge * 60 * 1000 },
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
router.use(bodyParser.json());
router.use(writeLog);
router.use(checkAuth);

router.post('/login', (req, res) => {
  let _un = req.body.un;
  let un = escape(_un);
  let pw = escape(req.body.pw);
  let succ = { result: true };
  let fail = { result: false };
  if (un && pw) {
    exec(`ldapwhoami -H ${ldapHost} -D "uid=${un},ou=People,dc=sparcs,dc=org" -w "${pw}"`,
      { shell: '/bin/sh', uid: nuid }, (err, stdout, stderr) => {
      logError(req, err);
      if (err || stdout.length === 0 || stderr.length !== 0) res.json(fail);
      else {
        req.session.un = _un;
        res.json(succ);
      }
    });
  } else res.json(fail)
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({});
});

router.get('/un', (req, res) => {
  res.json({ un: req.session.un });
});

router.post('/passwd', (req, res) => {
  let _un = req.session.un;
  let un = escape(_un);
  let opass = escape(req.body.opass);
  let _npass = req.body.npass;
  let npass = escape(_npass);
  let succ = { result: true };
  let weak = { result: false, weak: true };
  let fail = { result: false };
  if (un && opass && npass) {
    if (checkPassword(_npass, _un)) {
      exec(`ldappasswd -H ${ldapHost} -D "uid=${un},ou=People,dc=sparcs,dc=org" -S -w "${opass}" -s "${npass}"`,
        { shell: '/bin/sh', uid: nuid }, (err, stdout, stderr) => {
        logError(req, err);
        if (err || stdout.length !== 0 || stderr.length !== 0) res.json(fail);
        else res.json(succ);
      });
    } else res.json(weak);
  } else res.json(fail);
});

router.post('/create', (req, res) => {
  let un = req.session.un;
  let m = req.body.name;
  if (fs.existsSync(aliasDir + m)) {
    res.json({ result: false });
  } else {
    let info = (new Date()).toISOString().substring(0, 10) + ', by ' + un + ', ' + req.body.desc;
    fs.writeFile(aliasDir + m + '.info', info, {flag: 'w'}, err => {
      logError(req, err);
      fs.writeFile(aliasDir + m + '.template', 'mail-archive\n\n' + un, {flag: 'w'}, err => {
        logError(req, err);
        fs.writeFile(aliasFile, '\n' + `${m}: :include:${aliasDir}${m}`, {flag: 'as'}, err => {
          logError(req, err);
          fs.writeFile(aliasDir + m, 'mail-archive\n\n' + un, {flag: 'w'}, err => {
            logError(req, err);
            res.json({ result: true });
          });
        });
      });
    });
  }
});

router.get('/forward', (req, res) => {
  let path = homeDir + req.session.un + '/.forward';
  fs.stat(path, (err, stats) => {
    logError(req, err);
    if (err) res.json({ mail: '' });
    else fs.readFile(path, (err, buf) => {
      logError(req, err);
      if (err) res.json({ mail: '' });
      else res.json({ mail: buf.toString() });
    });
  });
});

router.post('/forward', (req, res) => {
  let mail = req.body.mail;
  let path = homeDir + req.session.un + '/.forward'
  fs.writeFile(path, mail, {flag: 'w'}, err => {
    logError(req, err);
    if (err) res.json({ result: false });
    else res.json({ result: true });
  });
});

router.get('/edalias', (req, res) => {
  let un = req.session.un;
  fs.readdir(aliasDir, (err, files) => {
    logError(req, err);
    let all = files.filter(f => {
      return f.endsWith('.template');
    }).map(f => {
      return f.replace('.template', '');
    });
    let info = {};
    all.forEach(f => {
      let path = aliasDir + f + '.info';
      if (fs.existsSync(path)) info[f] = fs.readFileSync(path).toString();
    });
    let aliases = all.filter(f => {
      return fs.readFileSync(aliasDir + f).toString().split('\n').includes(un);
    });
    res.json({ all: all, info: info, aliases: aliases });
  })
});

router.post('/edalias', (req, res) => {
  let un = req.session.un;
  req.body.added.forEach(m => {
    fs.writeFileSync(aliasDir + m, '\n' + un, {flag: 'as'});
  });
  req.body.removed.forEach(m => {
    let uns = fs.readFileSync(aliasDir + m).toString().split('\n');
    uns.splice(uns.indexOf(un));
    fs.writeFileSync(aliasDir + m, uns.join('\n'), {flag: 'w'});
  });
  res.json({ result: true });
});

router.post('/reset', (req, res) => {
  let un = req.body.un;
  if (un) {
    ResetModel.findOne({ un: un }, (err, _reset) => {
      logError(req, err);
      if (!_reset || Date.now() - _reset.date > resetTime * 60 * 1000) {
        ResetModel.deleteOne({ un: un }, err => { logError(req, err); });
        let reset = new ResetModel();
        reset.un = un;
        let link = resetLink + 'reset/' + reset.serial;
        let mail = {
          to: un + '@' + mailTo,
          subject: mailSubject,
          text: link,
          html: '<a href="' + link + '">Reset password</a>'
        };
        transporter.sendMail(mail, err => {
          logError(req, err);
          if (!err) reset.save();
        });
      }
    });
  }
  res.json({});
});

router.get('/nugu', (req, res) => {
  let un = req.session.un;
  mysqlQuery('select * from user where id=?', [un], (err, results, fields) => {
    logError(req, err);
    if (err || results.length === 0)
      res.json({ result: false });
    else
      res.json({ result: true, obj: results[0] });
  });
});

router.post('/nugu', (req, res) => {
  let un = req.session.un;
  let nobj = req.body.nobj;
  if (nobj) {
    function query() {
      let keys = Object.keys(nobj);
      if (keys.length > 0) {
        let field = keys[0];
        let value = nobj[field];
        delete nobj[field];
        mysqlQuery(`update user set ${field}=? where id=?`, [value, un], (err, results) => {
          logError(req, err);
          if (err) res.json({ result: false });
          else query();
        });
      } else {
        res.json({ result: true });
      }
    }
    query();
  } else res.json({ result: false });
});

router.post('/nugus', (req, res) => {
  let name = req.body.name;
  if (name) {
    mysqlQuery('select * from user where id=?', [name], (err, results) => {
      logError(req, err);
      if (err)
        res.json({ result: false });
      else if (results.length > 0)
        res.json({ result: true, objs: results });
      else {
        mysqlQuery('select * from user where name=?', [name], (err, results) => {
          logError(req, err);
          if (err)
            res.json({ result: false });
          else if (results.length > 0)
            res.json({ result: true, objs: results });
          else
            res.json({ result: true });
        });
      }
    });
  } else res.json({ result: false });
});

router.get('/reset/:serial', (req, res) => {
  let serial = req.params.serial;
  ResetModel.findOne({ serial: serial }, (err, reset) => {
    logError(req, err);
    if (!reset) res.json({ result: false });
    else if (Date.now() - reset.date > resetTime * 60 * 1000) {
      ResetModel.deleteOne({ serial: serial }, err => {
        logError(req, err);
      });
      res.json({ result: false });
    } else
      res.json({ result: true });
  });
});

router.post('/reset/:serial', (req, res) => {
  let serial = req.params.serial;
  ResetModel.findOne({ serial: serial }, (err, reset) => {
    logError(req, err);
    if (!reset)
      res.json({ result: false });
    else {
      if (Date.now() - reset.date > resetTime * 60 * 1000)
        res.json({ result: false });
      else {
        let _un = reset.un;
        let un = escape(_un);
        let _npass = req.body.npass;
        let npass = escape(_npass);
        let apass = escape(adminPassword);
        if (checkPassword(_npass, _un)) {
          exec(`ldappasswd -H ${ldapHost} -D "cn=admin,dc=sparcs,dc=org" -S -w "${apass}" "uid=${un},ou=People,dc=sparcs,dc=org" -s "${npass}"`,
            { shell: '/bin/sh', uid: nuid }, (err, stdout, stderr) => {
            logError(req, err);
            if (err) res.json({ result: true, succ: false });
            else if (stdout.length === 0 && stderr.length === 0) res.json({ result: true, succ: true });
            else res.json({ result: true, succ: false });
          });
        } else res.json({ result: true, succ: false });
      }
      ResetModel.deleteOne({ serial: serial }, err => { logError(req, err); });
    }
  });
});

router.post('/wheel/add', (req, res) => {
  let _un = req.body.un;
  let un = escape(_un);
  let name = req.body.name;
  let apass = escape(adminPassword);
  let _npass = req.body.npass;
  let npass = escape(_npass);
  let year = new Date().getFullYear();
  let first = (year - 2010) * 100 + 4101;
  let path = `/${un}.ldif`;
  let home = homeDir + un;
  if (checkPassword(_npass, _un)) {
    exec(`ldapsearch -H ${ldapHost} -x -LLL -b "ou=People,dc=sparcs,dc=org" | grep uidNumber:`,
      { shell: '/bin/sh', uid: nuid }, (err, stdout, stderr) => {
      logError(req, err);
      let uids = stdout.replace(/uidNumber: /gi, '')
        .split('\n').map(parseInt).filter(i => { return first <= i; })
      let uid = first;
      while (uids.includes(uid)) uid++;

      let ldif =
        `dn: uid=${un},ou=People,dc=sparcs,dc=org` + '\n' +
        `uid: ${un}` + '\n' +
        `cn: ${un}` + '\n' +
        'objectClass: account\n' +
        'objectClass: posixAccount\n' +
        'objectClass: top\n' +
        'objectClass: shadowAccount\n' +
        'shadowMax: 99999\n' +
        'shadowWarning: 7\n' +
        'loginShell: /bin/bash\n' +
        `uidNumber: ${uid}` + '\n' +
        'gidNumber: 400\n' +
        `homeDirectory: /home/${un}`;
      fs.writeFile(path, ldif, {flag: 'w'}, err => {
        logError(req, err);
        exec(`ldapadd -H ${ldapHost} -D "cn=admin,dc=sparcs,dc=org" -w "${apass}" -f ${path}`,
          { shell: '/bin/sh', uid: nuid }, (err, stdout, stderr) => {
          logError(req, err);
          if (err || stderr) {
            fs.unlink(path, err => {
              logError(req, err);
              res.json({ result: false });
            });
          } else {
            exec(`ldappasswd -H ${ldapHost} -D "cn=admin,dc=sparcs,dc=org" -S -w "${apass}" "uid=${un},ou=People,dc=sparcs,dc=org" -s "${npass}"`,
              { shell: '/bin/sh', uid: nuid }, (err, stdout, stderr) => {
              logError(req, err);
              fs.unlink(path, err => {
                logError(req, err);
                fs.mkdir(home, err => {
                  logError(req, err);
                  mysqlQuery('insert into user(id, name) values(?, ?)', [_un, name], err => {
                    logError(req, err);
                    res.json({ result: true });
                  });
                });
              });
            });
          }
        });
      });
    })
  } else res.json({ result: false, weak: true });
});

router.post('/wheel/delete', (req, res) => {
  let _un = req.body.un;
  let un = escape(_un);
  let apass = escape(adminPassword);
  let home = homeDir + un;
  let forward = home + '/.forward'
  exec(`ldapdelete -H ${ldapHost} -D "cn=admin,dc=sparcs,dc=org" -w "${apass}" "uid=${un},ou=People,dc=sparcs,dc=org"`,
    { shell: '/bin/sh', uid: nuid }, (err, stdout, stderr) => {
    logError(req, err);
    if (err || stderr)
      res.json({ result: false });
    else {
      fs.readdir(aliasDir, (err, files) => {
        logError(req, err);
        let all = files.filter(f => {
          return f.endsWith('.template');
        }).map(f => {
          return f.replace('.template', '');
        });
        all.forEach(m => {
          let uns = fs.readFileSync(aliasDir + m).toString().split('\n');
          uns.splice(uns.indexOf(un));
          fs.writeFileSync(aliasDir + m, uns.join('\n'), {flag: 'w'});
        });
        fs.unlink(forward, err => {
          logError(req, err);
          fs.rmdir(home, err => {
            logError(req, err);
            mysqlQuery('delete from user where id=?', [_un], err => {
              logError(req, err);
              res.json({ result: true });
            });
          });
        });
      });
    }
  });
});

module.exports = router;
