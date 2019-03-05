const express = require('express');
const api = require('./api.js');
const app = express();
const { port } = require('../config/config.js');
const { logStr } = require('./log.js');

app.use('/api', api);

app.listen(port, () => {
  logStr(process.env.NODE_ENV);
  logStr('The server running at port ' + port);
});
