const express = require('express');
const ldap = require('./ldap.js');
const log = require('./log.js');

const router = express.Router();

/**
 * @api {post} /login Login
 * @apiName Login
 * @apiGroup Login

 * @apiParam {String} un Username
 * @apiParam {String} pw Password

 * @apiSuccess {Boolean} result Indicate whether succeeded (not recommanded to use)
 * @apiSuccess {Boolean} success Indicate whether succeeded
 */

router.post('/', (req, res) => {
  let un = req.body.un;
  let pw = req.body.pw;

  ldap.auth(un, pw).then(() => {
    req.session.un = un;
    res.json({ result: true, success: true });
  }).catch(err => {
    log.error(req, err);
    res.json({ result: false, success: false });
  });
});

module.exports = router;
