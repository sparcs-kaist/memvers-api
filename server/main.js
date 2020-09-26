const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const csrf = require('csurf');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const MongoStore = require('connect-mongo')(session);

const log = require('./log.js');
const { initDB } = require('./db.js');

const { port, secure, maxAge, secret } = require('../config/config.js');

const app = express();

function writeLog(req, res, next) {
  log.req(req);
  next();
}

initDB();
app.use(cors({
  origin: ['http://memvers.sparcs.org', 'https://memvers.sparcs.org'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Cookie', 'CSRF-Token']
}));
app.use(cookieParser());
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: secure, maxAge: maxAge * 60 * 1000 },
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(bodyParser.json());
app.use(writeLog);

// Login should work without CSRF, because sparcs.org uses it to refresh users
app.use('/login', require('./routers/login.js'));

app.use(csrf());
app.use('*', (req, res, next) => {
  res.cookie('csrf-token', req.csrfToken());
  next();
});

app.get('/', (req, res) => {
  // This endpoint, which seems useless, is needed to get the CSRF token
  res
    .status(418)
    .json({
      'Server': 'Memvers-API',
      'Developed-By': 'SPARCS'
    });
});

['account', 'forward', 'logout', 'mailing', 'nugu', 'passwd', 'reset', 'un', 'users']
  .forEach(r => app.use('/' + r, require('./routers/' + r + '.js')));

app.listen(port, () => {
  log.str(process.env.NODE_ENV);
  log.str('The server running at port ' + port);
});
