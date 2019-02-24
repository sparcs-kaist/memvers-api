const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')
const { exec, execSync } = require('child_process');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();
const transporter = nodemailer.createTransport({host: "127.0.0.1", port: 25});
const Schema = mongoose.Schema;
const aliasdir = '/SPARCS/mail/aliases.d/';
const aliasfile = '/etc/aliases';
const homedir = '/home/';
const adminPasswordFile = '/admin_password'

const resetLength = 50;
const resetTime = 1200;
const nuid = parseInt(execSync('id -u nobody', { shell: '/bin/sh' }));

function randChar() { return String.fromCharCode(97 + Math.floor(Math.random() * 26)); }
function randStr() {
  let s = '';
  for (var i = 0; i < resetLength; i++) s += randChar();
  return s;
}

mongoose.connect('mongodb://127.0.0.1/wedalias');
const resetSchema = new Schema({
  un: { type: String },
  serial: { type: String, default: randStr },
  date: { type: Date, default: Date.now }
});
const ResetModel = mongoose.model('resets', resetSchema);

function checkAuth(req, res, next) {
  let un = req.session.un;
  let url = req.url;
  if (url.endsWith('/')) url = url.substring(0, url.length - 1);
  if (url !== '/login' && url !== '/api/login' &&
      !url.startsWith('/reset') && !url.startsWith('/api/reset') &&
      un === undefined) {
    if (url.startsWith('/api'))
      res.json({ expired: true });
    else
      res.redirect('/login');
  } else if (url === '/login' && un !== undefined)
    res.redirect('/');
  else if (url === '/reset' && un !== undefined)
    res.redirect('/passwd');
  else
    next();
}

app.use(session({
  secret: 'foo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 600000 },
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(express.static('static'));
app.use(bodyParser.json());
app.use(checkAuth);
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').renderFile);

function escape(str) {
  return str
    .replace(/\\/gi, '\\\\')
    .replace(/\"/gi, '\\\"')
    .replace(/\$/gi, '\\$');
}

app.get('/', (req, res) => {
  res.render('main.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/passwd', (req, res) => {
  res.render('passwd.ejs');
});

app.get('/mkml', (req, res) => {
  res.render('mkml.ejs');
});

app.get('/forward', (req, res) => {
  res.render('forward.ejs');
});

app.get('/edalias', (req, res) => {
  res.render('edalias.ejs');
});

app.get('/reset', (req, res) => {
  res.render('reset.ejs');
});

app.get('/reset/:serial', (req, res) => {
  let serial = req.params.serial;
  ResetModel.findOne({ serial: serial }, (err, reset) => {
    if (!reset)
	  res.end('Link not exists');
	else if (Date.now() - reset.date > resetTime * 1000) {
	  ResetModel.deleteOne({ serial: serial }, err => {});
	  res.end('Link expired');
	} else
      res.render('reset.html');
  });
});

app.post('/api/login', (req, res) => {
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

app.post('/api/passwd', (req, res) => {
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

app.post('/api/create', (req, res) => {
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

app.get('/api/forward', (req, res) => {
  let path = homedir + req.session.un + '/.forward'
  fs.stat(path, (err, stats) => {
    if (err) res.json({ mail: '' });
    else fs.readFile(path, (err, buf) => {
      if (err) res.json({ mail: '' });
      else res.json({ mail: buf.toString() });
    });
  });
});

app.post('/api/forward', (req, res) => {
  let mail = req.body.mail;
  let path = homedir + req.session.un + '/.forward'
  fs.writeFile(path, mail, {flag: 'w'}, err => {
    if (err) res.json({ result: false });
    else res.json({ result: true });
  });
});

app.get('/api/edalias', (req, res) => {
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

app.post('/api/edalias', (req, res) => {
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

app.post('/api/reset', (req, res) => {
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

app.post('/api/reset/:serial', (req, res) => {
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

const server = app.listen(80, () => {
  console.log('The server running at port 80');
});
