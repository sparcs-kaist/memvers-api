const express = require('express');
const fs = require('fs').promises;
const fse = require('fs-extra');
const locks = require('locks');
const ldap = require('../ldap.js');
const auth = require('../auth.js');
const { success, failure, errorWith, json } = require('../response.js');
const { mysqlQuery } = require('../db.js');
const { checkPassword } = require('../util.js');
const { aliasDir, homeDir } = require('../../config/config.js');
const { ForwardList, MailingList } = require('../db.js');

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
        let uid = undefined;
        ldap.uids()
        .then(uids => {
          uid = getUid(uids);
          return fs.writeFile(path, ldap.ldif(un, uid));
        })
        .then(() => ldap.add(path))
        .then(() => Promise.all([
          ldap.passwdByAdmin(un, npass),
          fs.unlink(path),
          fs.mkdir(home).then(() => fs.chown(home, uid, 400)),
          mysqlQuery('insert into user(id, name) values(?, ?)', [un, name]),
          ForwardList.create({
            from: 'sparcs',
            to: un
          })
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

  Promise.all([
    ldap.del(un),
    fse.remove(home),
    mysqlQuery('delete from user where id=?', [un]),
    ForwardList.destroy({
      where: {
        to: un
      }
    })
  ])
  .then(success)
  .catch(failure)
  .then(json(res));
});

module.exports = router;
