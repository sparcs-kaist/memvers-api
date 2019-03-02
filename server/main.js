const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const { initDB, ResetModel } = require('./db.js');
const api = require('./api.js');
const { port, resetTime, secure, maxAge } = require('../config/config.js');
const { secret } = require('../config/local_config.js');

const app = express();

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
  else if (url.startsWith('/wheel') && un !== 'wheel')
    res.redirect('/');
  else if (url.startsWith('/api/wheel') && un !== 'wheel')
    res.json({ expired: true });
  else
    next();
}

initDB();
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: secure, maxAge: maxAge * 60 * 1000 },
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(express.static('static'));
app.use(bodyParser.json());
app.use(checkAuth);
app.use('/api', api);
app.set('views', __dirname + '/../views');
app.engine('.html', require('ejs').renderFile);

app.get('/', (req, res) => {
  res.render('main.ejs', { un: req.session.un });
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

app.get('/wheel/add', (req, res) => {
  res.render('add.ejs');
});

app.get('/wheel/delete', (req, res) => {
  res.render('delete.ejs');
});

app.get('/reset/:serial', (req, res) => {
  let serial = req.params.serial;
  ResetModel.findOne({ serial: serial }, (err, reset) => {
    if (!reset)
      res.end('Link not exists');
    else if (Date.now() - reset.date > resetTime * 60 * 1000) {
      ResetModel.deleteOne({ serial: serial }, err => {});
      res.end('Link expired');
    } else
      res.render('reset.html');
  });
});

const server = app.listen(port, () => {
  console.log(process.env.NODE_ENV);
  console.log('The server running at port ' + port);
});
