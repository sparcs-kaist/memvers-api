const express = require('express');
const auth = require('../auth.js');
const { success, successWith, failure, errorWith, json } = require('../response.js');
const { mysqlQuery } = require('../db.js');

const router = express.Router();
router.use(auth.loginOnly);

const searchQuery = 'select * from user where id=?';
const nameQuery = 'select * from user where name=?';
const updateQuery = field => `update user set ${field}=? where id=?`;

/**
 * @api {get} /nugu Get nugu
 * @apiName GetNugu
 * @apiGroup Nugu
 * @apiDescription Get 'nugu' data
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Object} obj 'nugu' data
 * @apiSuccess {Number} error The reason of the failure (
 * <code>undefined</code> if succeeded;
 * <code>0</code> if the user does not exist in 'nugu';
 * <code>1</code> if database error)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.get('/', (req, res) => {
  let un = req.session.un;
  mysqlQuery(searchQuery, [un])
  .then(results =>
    (results.length > 0) ?
    successWith('obj', results[0])() :
    errorWith(0)()
  )
  .catch(errorWith(1))
  .then(json(res));
});

/**
 * @api {post} /nugu Edit nugu
 * @apiName PostNugu
 * @apiGroup Nugu
 * @apiDescription Modify 'nugu' data
 *
 * @apiParam {Object} nobj An object containing new 'nugu' data
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Number} error The reason of the failure (
 * <code>undefined</code> if succeeded;
 * <code>0</code> if database error
 * <code>1</code> <code>nobj</code> is not given)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.post('/', (req, res) => {
  let un = req.session.un;
  let nobj = req.body.nobj;
  if (nobj) {
    Promise.all(Object.keys(nobj).map(field =>
      mysqlQuery(updateQuery(field), [nobj[field], un])
    ))
    .then(success)
    .catch(errorWith(0))
    .then(json(res));
  } else res.json(errorWith(1)());
});

/**
 * @api {get} /nugu/:name Get nugu by name
 * @apiName GetNuguName
 * @apiGroup Nugu
 * @apiDescription Get 'nugu' data related to a given name
 *
 * @apiParam {String} name A URL encoded name for searching
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Object[]} objs Array of 'nugu' data
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.get('/:name', (req, res) => {
  let name = decodeURIComponent(req.params.name);
  mysqlQuery(searchQuery, [name])
  .then(objs =>
    (objs.length > 0) ?
    successWith('objs', objs)() :
    mysqlQuery(nameQuery, [name]).then(objs => successWith('objs', objs)())
  )
  .catch(failure)
  .then(json(res));
});

module.exports = router;
