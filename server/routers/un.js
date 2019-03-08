const express = require('express');
const auth = require('../auth.js');

const router = express.Router();
router.use(auth.loginOnly);

/**
 * @api {get} /un Un
 * @apiName Un
 * @apiGroup Auth
 * @apiDescription Get username
 *
 * @apiSuccess {String} un Username
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.get('/', (req, res) => {
  res.json({ un: req.session.un });
});
