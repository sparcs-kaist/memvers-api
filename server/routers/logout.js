const express = require('express');
const auth = require('../auth.js');

const router = express.Router();
router.use(auth.loginOnly);

/**
 * @api {post} /logout Logout
 * @apiName Logout
 * @apiGroup Auth
 * @apiDescription Log out
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.post('/', (req, res) => {
  req.session.destroy();
  res.json({});
});

module.exports = router;
