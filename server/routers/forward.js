const express = require('express');
const fs = require('fs').promises;
const log = require('../log.js');
const auth = require('../auth.js');
const { homeDir } = require('../config/config.js');

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
router.get('/forward', (req, res) => {
  let path = homeDir + req.session.un + '/.forward';
  fs.readFile(path)
  .then(data => { success: true, mail: data.toString() })
  .catch(() => { success: true, mail: '' })
  .finally(res.json);
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
router.post('/forward', (req, res) => {
  let mail = req.body.mail;
  let path = homeDir + req.session.un + '/.forward'
  fs.writeFile(path, mail)
  .then(() => { success: true })
  .catch(err => {
    log.error(req, err);
    return { success: false };
  })
  .finally(res.json);
});

module.exports = router;
