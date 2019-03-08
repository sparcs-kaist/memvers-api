const express = require('express');
const ldap = require('../ldap.js');
const log = require('../log.js');

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
    res.json({ success: true });
  }).catch(err => {
    log.error(req, err);
    res.json({ success: false });
  });
});

module.exports = router;
