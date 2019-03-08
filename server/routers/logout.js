const express = require('express');
const router = express.Router();

/**
 * @api {post} /logout Logout
 * @apiName Logout
 * @apiGroup Logout
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({});
});

module.exports = router;
