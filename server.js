const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')
const { exec } = require('child_process');
const app = express();
const aliasdir = '/SPARCS/mail/aliases.d/';
const aliasfile = '/etc/aliases';
const homedir = '/home/';

function escape(str) {
  return str
    .replace(/\\/gi, '\\\\')
    .replace(/\"/gi, '\\\"')
    .replace(/\$/gi, '\\$')
    .replace(/!/gi, '\\!');
}

function login(body, cb0, cb1) {
  let _un = body.un;
  let un = escape(_un);
  let pw = escape(body.pw);
  if (un && pw) {
    exec(`ldapwhoami -H ldap://ldap.sparcs.org -D "uid=${un},ou=People,dc=sparcs,dc=org" -w "${pw}"`, (error, stdout, stderr) => {
      if (error) cb1();
      else if (stdout.length > 0 && stderr.length === 0) cb0(_un);
      else cb1();
    });
  } else cb1();
}

app.use(express.static('static'));
app.use(bodyParser.json());
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').renderFile);

app.get('/', (req, res) => {
  res.render('edalias.html');
});

app.post('/login', (req, res) => {
  login(req.body, un => {
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
      let mail = '';
      if (fs.existsSync(homedir + un + '/.forward')) mail = fs.readFileSync(homedir + un + '/.forward').toString();
      res.json({ result: true, all: all, info: info, aliases: aliases, mail: mail });
    })
  }, () => { res.json({ result: false }); });
});

app.post('/update', (req, res) => {
  login(req.body, un => {
    req.body.added.forEach(m => {
      fs.writeFileSync(aliasdir + m, '\n' + un, {flag: 'as'});
    });
    req.body.removed.forEach(m => {
      let uns = fs.readFileSync(aliasdir + m).toString().split('\n');
      uns.splice(uns.indexOf(un));
      fs.writeFileSync(aliasdir + m, uns.join('\n'), {flag: 'w'});
    });
    res.json({ result: true });
  }, () => { res.json({ result: false }); });
});

app.post('/create', (req, res) => {
  login(req.body, un => {
    let m = req.body.name;
    if (fs.existsSync(aliasdir + m)) {
      res.json({ result: true, succ: false });
    } else {
      let info = (new Date()).toISOString().substring(0, 10) + ', by ' + un + ', ' + req.body.desc;
      fs.writeFile(aliasdir + m + '.info', info, {flag: 'w'}, err => {
        if (err) { res.json({ result: true, succ: false }); return; }
        fs.writeFile(aliasdir + m + '.template', 'mail-archive\n\n' + un, {flag: 'w'}, err => {
          if (err) { res.json({ result: true, succ: false }); return; }
          fs.writeFile(aliasfile, `${m}: :include:${aliasdir}${m}`, {flag: 'as'}, err => {
            if (err) { res.json({ result: true, succ: false }); return; }
            fs.writeFile(aliasdir + m, 'mail-archive\n\n' + un, {flag: 'w'}, err => {
              if (err) { res.json({ result: true, succ: false }); return; }
              res.json({ result: true, succ: true });
            });
          });
        });
      });
    }
  }, () => { res.json({ result: false }); });
});

app.post('/forward', (req, res) => {
  login(req.body, un => {
    let mail = req.body.mail;
    let path = homedir + req.body.un + '/.forward'
    fs.writeFile(path, mail, {flag: 'w'}, err => {
      if (err) res.json({ result: true, succ: false });
      else res.json({ result: true, succ: true });
    });
  }, () => { res.json({ result: false }); });
});

const server = app.listen(80, () => {
  console.log('The server running at port 80');
});
