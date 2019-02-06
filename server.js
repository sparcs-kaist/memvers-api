const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')
const { exec } = require('child_process');
const app = express();
const aliasdir = '/SPARCS/mail/aliases.d/';

function escape(str) {
  return str
    .replace(/\\/gi, '\\\\')
    .replace(/\"/gi, '\\\"')
    .replace(/\$/gi, '\\$')
    .replace(/!/gi, '\\!');
}

app.use(bodyParser.json());
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').renderFile);

app.get('/', (req, res) => {
  res.render('login.html');
});

app.post('/login', (req, res) => {
  let _un = req.body.un;
  let un = escape(_un);
  let pw = req.body.pw;

  if (un && pw) {
    exec(`ldapwhoami -H ldap://ldap.sparcs.org -D "uid=${un},ou=People,dc=sparcs,dc=org" -w "${pw}"`, (error, stdout, stderr) => {
      if (stdout.length > 0 && stderr.length === 0) {
        fs.readdir(aliasdir, (err, files) => {
          let all = files.filter(f => {
            return f.endsWith('.template');
          }).map(f => {
            return f.replace('.template', '');
          });
          let aliases = all.filter(f => {
            return fs.readFileSync(aliasdir + f).toString().split('\n').includes(_un);
          });
          res.json({ result: true, all: all, aliases: aliases });
        })
      } else {
        res.json({ result: false });
      }
    });
  } else {
    res.json({ result: false });
  }
});

app.post('/update', (req, res) => {
  let _un = req.body.un;
  let un = escape(_un);
  let pw = req.body.pw;
  if (un && pw) {
    exec(`ldapwhoami -H ldap://ldap.sparcs.org -D "uid=${un},ou=People,dc=sparcs,dc=org" -w "${pw}"`, (error, stdout, stderr) => {
      if (stdout.length > 0 && stderr.length === 0) {
        req.body.added.forEach(m => {
          fs.writeFileSync(aliasdir + m, '\n' + _un, {flag: 'as'});
        });
        req.body.removed.forEach(m => {
          let uns = fs.readFileSync(aliasdir + m).toString().split('\n');
          uns.splice(uns.indexOf(_un));
          fs.writeFileSync(aliasdir + m, uns.join('\n'), {flag: 'w'});
        });
        res.json({ result: true });
      } else {
        res.json({ result: false });
      }
    });
  } else {
    res.json({ result: false });
  }
});

const server = app.listen(80, () => {
  console.log('The server running at port 80');
});
