const express = require('express');
const ldap = require('../ldap.js');
const auth = require('../auth.js');
const { success, errorWith, json } = require('../response.js');
const { checkPassword } = require('../util.js');

const router = express.Router();

/**
 * @api {post} /passwd Passwd
 * @apiName Passwd
 * @apiGroup Passwd
 * @apiDescription Change a password
 *
 * @apiParam {String} opass A current password
 * @apiParam {String} npass A new password
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Number} error The reason of the failure (
 * <code>undefined</code> if succeeded;
 * <code>0</code> if <code>opass</code> is wrong;
 * <code>1</code> if <code>npass</code> is weak)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.post('/', auth.loginOnly, (req, res) => {
  let un = req.session.un;
  let opass = req.body.opass;
  let npass = req.body.npass;

  if (checkPassword(npass, un))
    ldap.passwd(un, opass, npass)
    .then(success)
    .catch(errorWith(0))
    .then(json(res));
  else res.json(errorWith(1)());
});

/**
 * @api {post} /passwd/admin/:un Force Passwd
 * @apiName Force Passwd
 * @apiGroup Passwd
 * @apiDescription Change a password by admin permission
 *
 * @apiParam {String} npass A new password
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Number} error The reason of the failure (
 * <code>undefined</code> if succeeded;
 * <code>0</code> if <code>un</code> does not exist;
 * <code>1</code> if <code>npass</code> is weak)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 * @apiError (Error 403) Forbidden Not a wheel account
 */
router.post('/admin/:un', auth.wheelOnly, (req, res) => {
  const un = req.params.un;
  const npass = req.body.npass;

  if (!checkPassword(npass, un)) {
    res.json(errorWith(1)());
    return;
  }

  ldap.passwdByAdmin(un, npass)
    .then(success)
    .catch(errorWith(0))
    .then(json(res))
});

module.exports = router;
