const express = require('express');
const fs = require('fs').promises;
const locks = require('locks');
const ldap = require('../ldap.js');
const auth = require('../auth.js');
const { success, failure, errorWith, json } = require('../response.js');
const { mysqlQuery } = require('../db.js');
const { checkPassword } = require('../util.js');
const { aliasDir, homeDir } = require('../../config/config.js');

const mutex = locks.createMutex();
const router = express.Router();
router.use(auth.wheelOnly);

/**
 * @api {put} /account/:un Create account
 * @apiName PutAccount
 * @apiGroup Account
 * @apiDescription Create a new account
 *
 * @apiParam {String} un A URL encoded username
 * @apiParam {String} name A name in Hangul
 * @apiParam {String} npass A password
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Number} error The reason of the failure (
 * <code>undefined</code> if succeeded;
 * <code>0</code> if <code>un</code> already exists;
 * <code>1</code> if <code>npass</code> is weak;
 * <code>2</code> if <code>name</code> or <code>npass</code> is not given)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 * @apiError (Error 403) Forbidden Not a wheel account
 */
router.put('/:un', (req, res) => {
  let un = decodeURIComponent(req.params.un);
  let name = req.body.name;
  let npass = req.body.npass;

  let path = `/${un}.ldif`;
  let home = homeDir + un;

  function getUid(_uids) {
    let year = new Date().getFullYear();
    let uid = (year - 2010) * 100 + 4101;
    let uids = _uids.filter(i => { return uid <= i; });
    while (uids.includes(uid)) uid++;
    return uid;
  }

  if (un && name && npass) {
    if (checkPassword(npass, un)) {
      mutex.lock(() => {
        ldap.uids()
        .then(uids => fs.writeFile(path, ldap.ldif(un, getUid(uids))))
        .then(() => ldap.add(path))
        .then(() => Promise.all([
          ldap.passwdByAdmin(un, npass),
          fs.unlink(path),
          fs.mkdir(home),
          mysqlQuery('insert into user(id, name) values(?, ?)', [un, name])
        ]))
        .then(success)
        .catch(errorWith(0))
        .then(json(res))
        .then(() => mutex.unlock());
      });
    } else res.json(errorWith(1)());
  } else res.json(errorWith(2)());
});

/**
 * @api {delete} /account/:un Delete account
 * @apiName DelAccount
 * @apiGroup Account
 * @apiDescription Delete an existing account
 *
 * @apiParam {String} un A URL encoded username
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 *
 * @apiError (Error 401) Unauthorized Not logged in
 * @apiError (Error 403) Forbidden Not a wheel account
 */
router.delete('/:un', (req, res) => {
  let un = decodeURIComponent(req.params.un);

  let home = homeDir + un;
  let forward = home + '/.forward'

  function removeAlias(files) {
    return Promise.all(
      files
      .filter(f => f.endsWith('.template'))
      .map(f => {
        let m = f.replace('.template', '');
        return fs.readFile(aliasDir + m)
        .then(data => {
          let uns = data.toString().split('\n');
          uns.splice(uns.indexOf(un));
          return fs.writeFile(aliasDir + m, uns.join('\n'));
        });
      })
    );
  }

  Promise.all([
    ldap.del(un),
    fs.readdir(aliasDir).then(removeAlias),
    unlink(forward).then(() => fs.rmdir(home)),
    mysqlQuery('delete from user where id=?', [un])
  ])
  .then(success)
  .catch(failure)
  .then(json(res));
});

function unlink(path) {
  return fs.stat(path)
    .then(() => fs.unlink(path))
    .catch(() => {});
}

module.exports = router;
