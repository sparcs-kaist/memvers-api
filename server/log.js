function logStr(str) {
  if (str) console.log(new Date().toString() + '\t' + str);
}

function log(req, _obj) {
  let ip = req.ip;
  let url = req.url;
  let _un = req.session.un;
  let un = _un ? _un : '';
  let obj = _obj ? _obj.toString() : '';
  logStr(`${ip}\t${url}\t${un}\t${obj}`);
}

function logError(req, err) {
  if (err) log(req, err);
}

module.exports = {
  log: log,
  logError: logError,
  logStr: logStr,
};
