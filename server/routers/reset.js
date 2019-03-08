const express = require('express');
const log = require('../log.js');
const { ResetModel } = require('../db.js');
const { checkPassword } = require('../util.js');

const router = express.Router();

function send(mail) {
  return new Promise((resolve, reject) =>
    transporter.sendMail(mail, err => {
      if (err) reject(err);
      else resolve();
    })
  );
}

/**
 * @api {post} /reset/:un Request reset
 * @apiName Reset
 * @apiGroup Reset
 * @apiDescription Send a reset request
 *
 * @apiParam {String} un A URL encoded username for reset
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 */
router.post('/reset/:un', (req, res) => {
  let un = decodeURIComponent(req.params.un);
  ResetModel.findOne({ un }).exec()
  .then(_reset =>
    (!_reset || Date.now() - _reset.date > resetTime * 60 * 1000) ?
    ResetModel.deleteOne({ un }).exec()
    .then(() => {
      let reset = new ResetModel();
      reset.un = un;
      let link = resetLink + 'reset/' + reset.serial;
      let mail = {
        to: un + '@' + mailTo,
        subject: mailSubject,
        text: link,
        html: '<a href="' + link + '">Reset password</a>'
      };
      return send(mail).then(() => { success: true });
    }) : { success: true }
  )
  .catch(err => {
    log.error(req, err);
    return { success: false };
  })
  .finally(res.json);
});

/**
 * @api {get} /reset/:serial Check reset
 * @apiName ResetS
 * @apiGroup Reset
 * @apiDescription Check validity of a reset serial number
 *
 * @apiParam {String} serial A URL encoded serial number
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Boolean} result Indicate validity
 */
router.get('/reset/:serial', (req, res) => {
  let serial = decodeURIComponent(req.params.serial);
  ResetModel.findOne({ serial: serial }).exec()
  .then(reset =>
    !reset ? { success: true, result: false } :
    ((Date.now() - reset.date > resetTime * 60 * 1000) ?
    ResetModel.deleteOne({ serial }).exec()
    .then(() => { success: true, result: false }) :
    { success: true, result: true })
  })
  .catch(err => {
    log.error(req, err);
    return { success: false };
  })
  .finally(res.json);
});

/**
 * @api {post} /reset/:serial Reset password
 * @apiName ResetP
 * @apiGroup Reset
 * @apiDescription Reset the password of an account related to a serial number
 *
 * @apiParam {String} serial A URL encoded serial number
 * @apiParam {String} npass A new password
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Number} error The reason of the failure (
 * <code>undefined</code> if succeeded;
 * <code>0</code> if <code>serial</code> is wrong;
 * <code>1</code> if <code>npass</code> is weak;
 * <code>2</code> if internal server error)
 */
router.post('/reset/:serial', (req, res) => {
  let serial = decodeURIComponent(req.params.serial);
  ResetModel.findOne({ serial }).exec()
  .then(reset => {
    if (!reset || Date.now() - reset.date > resetTime * 60 * 1000)
      return { success: false, error: 0 };
    else {
      let un = reset.un;
      let npass = req.body.npass;
      if (checkPassword(npass, un))
        return ResetModel.deleteOne({ serial }).exec()
          .then(() => ldapPasswdByAdmin(un, npass))
          .then(() => { success: true });
      else
        return { success: false, error: 1 };
    }
  })
  .catch(err => {
    log.error(req, err);
    return { success: false, error: 2 };
  })
  .finally(res.json);
});
