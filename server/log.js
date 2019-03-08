function str(str) {
  if (str) console.log(new Date().toString() + '\t' + str);
}

function log(req, _obj) {
  let url = req.originalUrl;
  let _un = req.session.un;
  let un = _un ? _un : '';
  let obj = _obj ? _obj.toString() : '';
  logStr(`${url}\t${un}\t${obj}`);
}

function error(req, err) {
  if (err) log(req, err);
}

module.exports = { error, str };
