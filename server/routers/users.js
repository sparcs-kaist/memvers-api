const express = require('express');
const auth = require('../auth.js');
const { success, successWith, failure, errorWith, json } = require('../response.js');
const { mysqlQuery } = require('../db.js');

const fields = 'id, name, is_developer, is_designer, is_undergraduate, github_id, linkedin_url, behance_url, website';
const publicQuery = `SELECT ${fields} FROM user WHERE is_private=0 ORDER BY ent_year DESC`;
const privateQuery = `SELECT ${fields} FROM user ORDER BY ent_year DESC`;

const router = express.Router();
/**
 * @api {get} /users/public Get public users
 * @apiName GetPublicUsers
 * @apiGroup Users
 * @apiDescription Get public 'nugu' data of public users
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Object[]} objs List of public 'nugu' data
 */
router.get('/public', (req, res) => {
	mysqlQuery(publicQuery)
	.then(objs => successWith('objs', objs)())
	.catch(failure)
	.then(json(res));
});

/**
 * @api {get} /users/all Get all users
 * @apiName GetAllUsers
 * @apiGroup Users
 * @apiDescription Get public 'nugu' data of all users
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Object[]} objs List of public 'nugu' data
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.get('/all', auth.loginOnly, (req, res) => {
	mysqlQuery(privateQuery)
	.then(objs => successWith('objs', objs)())
	.catch(failure)
	.then(json(res));
});

module.exports = router;
