const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const api = require('./api.js');
const log = require('./log.js');
const { initDB } = require('./db.js');

const { port, secure, maxAge } = require('../config/config.js');
const { secret } = require('../config/local_config.js');

const app = express();

function writeLog(req, res, next) {
  log.req(req);
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
router.use(cors({
  origin: ['http://memvers.sparcs.org', 'https://memvers.sparcs.org'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Cookie']
}));
app.use(bodyParser.json());
app.use(writeLog);

app.use('/api', api);

['account', 'forward', 'login', 'logout', 'mailing', 'nugu', 'passwd', 'reset', 'un']
  .forEach(r => app.use('/' + r, require('./routers/' + r + '.js')));

app.listen(port, () => {
  logStr(process.env.NODE_ENV);
  logStr('The server running at port ' + port);
});
