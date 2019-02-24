const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const { initDB, ResetModel } = require('./db.js');
const api = require('./api.js');

const app = express();

const resetLength = 50;
const resetTime = 1200;

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

initDB();
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
app.use('/api', api);
app.set('views', __dirname + '/../views');
app.engine('.html', require('ejs').renderFile);

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

const server = app.listen(80, () => {
  console.log('The server running at port 80');
});
