const express = require('express');
const api = require('./api.js');
const { port } = require('../config/config.js');
const { logStr } = require('./log.js');

const app = express();

function writeLog(req, res, next) {
  logStr(req.url);
  next();
}

app.use(express.static('static'));
app.use(writeLog);
app.use('/api', api);
app.set('views', __dirname + '/../static/views');
app.engine('.html', require('ejs').renderFile);

app.get('/', (_, res) => {
  res.render('main.ejs');
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
