function str(str) {
  if (str)
    /* eslint-disable no-console */
    console.log(new Date().toString() + '\t' + str);
    /* eslint-enable no-console */
}

function req(req, _obj) {
  let method = req.method;
  let url = req.originalUrl;
  let _un = req.session.un;
  let un = _un ? _un : '';
  let obj = _obj ? _obj.toString() : '';
  str(`${method}\t${url}\t${un}\t${obj}`);
}

function error(err) {
  if (err) {
    /* eslint-disable no-console */
    console.log(new Date().toString());
    console.log(err);
    /* eslint-enable no-console */
  }
}

module.exports = { str, req, error };
