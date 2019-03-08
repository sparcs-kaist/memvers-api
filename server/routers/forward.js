const express = require('express');
const fs = require('fs').promises;
const auth = require('../auth.js');
const { success, failure, successWith, json } = require('../response.js');
const { homeDir } = require('../../config/config.js');

const router = express.Router();
router.use(auth.loginOnly);

/**
 * @api {get} /forward Get forward
 * @apiName GetForward
 * @apiGroup Forward
 * @apiDescription Get a forwarding address
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {String} mail The current forwarding address
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.get('/', (req, res) => {
  let path = homeDir + req.session.un + '/.forward';
  fs.readFile(path)
  .then(data => successWith('mail', data.toString())())
  .catch(successWith('mail', ''))
  .then(json(res));
});

/**
 * @api {post} /forward Edit forward
 * @apiName PostForward
 * @apiGroup Forward
 * @apiDescription Modify a forwarding address
 *
 * @apiParam {String} mail A new forwarding address
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.post('/', (req, res) => {
  let mail = req.body.mail;
  if (mail === undefined) mail = '';
  let path = homeDir + req.session.un + '/.forward'
  fs.writeFile(path, mail)
  .then(success)
  .catch(failure)
  .then(json(res));
});

module.exports = router;
