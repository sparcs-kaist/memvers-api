const express = require('express');
const auth = require('../auth.js');

const router = express.Router();
router.use(auth.loginOnly);

/**
 * @api {get} /un Un
 * @apiName Un
 * @apiGroup Auth
 * @apiDescription Get a username
 *
 * @apiSuccess {String} un A username
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.get('/', (req, res) => {
  res.json({ un: req.session.un });
});

module.exports = router;
