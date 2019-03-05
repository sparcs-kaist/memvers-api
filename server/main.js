const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const { initDB, ResetModel } = require('./db.js');
const api = require('./api.js');
const { port, resetTime, secure, maxAge } = require('../config/config.js');
const { secret } = require('../config/local_config.js');
const { log, logError, logStr } = require('./log.js');

const app = express();

function writeLog(req, res, next) {
  log(req);
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
app.use(writeLog);
app.use('/api', api);
app.set('views', __dirname + '/../static/views');
app.engine('.html', require('ejs').renderFile);

app.get('/', (_, res) => {
  res.render('main.ejs');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

[
  'login', 'passwd', 'mkml', 'forward', 'edalias', 'reset', 'nugu', 'nugus'
].forEach(path => {
  app.get('/' + path, (_, res) => {
    res.render(path + '.ejs');
  });
});

[
  'add', 'delete'
].forEach(path => {
  app.get('/wheel/' + path, (_, res) => {
    res.render(path + '.ejs');
  });
});

app.get('/reset/:serial', (req, res) => {
  res.render('reset.html');
});

app.listen(port, () => {
  logStr(process.env.NODE_ENV);
  logStr('The server running at port ' + port);
});
