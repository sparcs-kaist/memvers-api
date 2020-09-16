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
    if(err && typeof err === 'object') {
      if (err.command) {
        // To prevent plain password being logged for failed ldap commands
        let errorStr = `Error while executing ${err.command}`;

        if (err.stdout) errorStr += `\nstdout: ${err.stdout}`;
        if (err.stderr) errorStr += `\nstderr: ${err.stderr}`;
        if (err.err) {
          err.err.message = errorStr;
          console.log(err.err);
          return;
        }

        console.log(errorStr);
        return;
      }
    }
    console.log(err);
    /* eslint-enable no-console */
  }
}

module.exports = { str, req, error };
