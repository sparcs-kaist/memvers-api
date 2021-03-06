const express = require('express');
const ldap = require('../ldap.js');
const { success, failure, json } = require('../response.js');

const router = express.Router();

/**
 * @api {post} /login Login
 * @apiName Login
 * @apiGroup Auth
 * @apiDescription Log in
 *
 * @apiParam {String} un A username
 * @apiParam {String} pw A password
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 */
router.post('/', (req, res) => {
  let un = req.body.un;
  let pw = req.body.pw;

  ldap.auth(un, pw).then(() => {
    req.session.un = un;
    return success();
  })
  // To disable password being logged
  .catch(() => failure(`Login failed for user ${un}`))
  .then(json(res));
});

module.exports = router;
