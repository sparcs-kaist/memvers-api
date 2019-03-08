const express = require('express');
const ldap = require('../ldap.js');
const auth = require('../auth.js');
const { success, errorWith } = require('../response.js');
const { checkPassword } = require('../util.js');

const router = express.Router();
router.use(auth.loginOnly);

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
router.post('/', (req, res) => {
  let un = req.session.un;
  let opass = req.body.opass;
  let npass = req.body.npass;

  if (checkPassword(npass, un))
    ldap.passwd(un, opass, npass)
    .then(success)
    .catch(errorWith(0))
    .finally(res.json);
  else res.json(errorWith(1)());
});

module.exports = router;
