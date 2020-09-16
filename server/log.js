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

const isProd = (process.env.NODE_ENV || 'development') !== 'development';

function error(err) {
  if (err) {
    /* eslint-disable no-console */
    console.log('====== START OF ERROR REPORT ======');
    console.log(`Error at ${new Date().toString()}`);

    if(err && typeof err === 'object') {
      let errorStr = '';

      if (err.command && isProd) {
        // To prevent plain password being logged for failed ldap commands
        errorStr += `\nwhile executing ${err.command}`;

        if (err.stdout) errorStr += `\nstdout: ${err.stdout}`;
        if (err.stderr) errorStr += `\nstderr: ${err.stderr}`;

        console.log(errorStr);
        return;
      }

      console.log(errorStr);
    }

    console.log(err);
    console.log('====== END OF ERROR REPORT ======');
    /* eslint-enable no-console */
  }
}

module.exports = { str, req, error };
