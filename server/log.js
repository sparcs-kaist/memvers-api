function str(str) {
  if (str)
    /* eslint-disable no-console */
    console.log(new Date().toString() + '\t' + str.toString());
    /* eslint-enable no-console */
}

function req(req, _obj) {
  let url = req.originalUrl;
  let _un = req.session.un;
  let un = _un ? _un : '';
  let obj = _obj ? _obj.toString() : '';
  str(`${url}\t${un}\t${obj}`);
}

const error = str;

module.exports = { str, req, error };
