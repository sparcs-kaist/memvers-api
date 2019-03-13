const express = require('express');
const fs = require('fs').promises;
const { success, failure, errorWith, json } = require('../response.js');
const auth = require('../auth.js');
const { aliasDir, aliasFile } = require('../../config/config.js');

const router = express.Router();
router.use(auth.loginOnly);

/**
 * @api {put} /mailing/:name Create
 * @apiName Create
 * @apiGroup Mailing
 * @apiDescription Create a new mailing list
 *
 * @apiParam {String} name A URL encoded name of the mailing list
 * @apiParam {String} desc A description for the mailing list
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Number} error The reason of the failure (
 * <code>undefined</code> if succeeded;
 * <code>0</code> if <code>name</code> exists;
 * <code>1</code> if internal server error;
 * <code>2</code> if <code>desc</code> is not given)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.put('/:name', (req, res) => {
  let un = req.session.un;
  let m = decodeURIComponent(req.params.name);
  let desc = req.body.desc;

  let file = aliasDir + m;
  let tfile = file + '.template';
  let ifile = file + '.info';

  let uns = 'mail-archive\n\n' + un;
  let info = (new Date()).toISOString().substring(0, 10) + ', by ' + un + ', ' + desc;
  let alias = '\n' + `${m}: :include:${aliasDir}${m}`;

  if (un && m && desc) {
    fs.stat(file)
    .then(errorWith(0))
    .catch(() =>
      Promise.all([
        fs.writeFile(file, uns),
        fs.writeFile(tfile, uns),
        fs.writeFile(ifile, info),
        fs.writeFile(aliasFile, alias, {flag: 'as'}),
      ])
      .then(success)
      .catch(errorWith(1))
    ).then(json(res))
  } else res.json(errorWith(2)());
});

/**
 * @api {Get} /mailing Get aliases
 * @apiName Aliases
 * @apiGroup Mailing
 * @apiDescription Get a list of aliases
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {String[]} all A complete list of mailing lists
 * @apiSuccess {Object} info A mapping from mailing lists to their descriptions
 * @apiSuccess {String[]} aliases A list of mailing lists, whom the user subscribed
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.get('/', (req, res) => {
  let un = req.session.un;

  fs.readdir(aliasDir)
  .then(files => {
    let all = files
      .filter(f => f.endsWith('.template'))
      .map(f => f.replace('.template', ''));

    function readAll(suffix) {
      return Promise.all(all.map(f =>
        fs.readFile(aliasDir + f + suffix)
        .then(data => {return {f, data}; })
        .catch(() => {return {f, data: ''}; })
      ));
    }

    return readAll('.info')
      .then(objs => {
        let info = {};
        objs.forEach(obj => info[obj.f] = obj.data.toString());

        return readAll('')
          .then(objs => {
            let aliases = objs
              .filter(obj => obj.data.toString().split('\n').includes(un))
              .map(obj => obj.f);
            return { success: true, all: all, info: info, aliases: aliases };
          })
      });
  })
  .catch(failure)
  .then(json(res))
});

/**
 * @api {Post} /mailing Edit aliases
 * @apiName Edaliases
 * @apiGroup Mailing
 * @apiDescription Modify subscription
 *
 * @apiParam {String[]} added Added mailing lists
 * @apiParam {String[]} removed Removed mailing lists
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Number} error The reason of the failure (
 * <code>undefined</code> if succeeded;
 * <code>0</code> if internal server error;
 * <code>1</code> if <code>added</code> or <code>removed</code> is not given)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.post('/', (req, res) => {
  let un = req.session.un;
  let added = req.body.added;
  let removed = req.body.removed;

  if (un && added && removed) {
    let proms = [...new Set(added.concat(removed))].map(m =>
      fs.readFile(aliasDir + m)
      .then(data => {
        let uns = data.toString().split('\n');
        let i = -1;
        while ((i = uns.indexOf(un)) >= 0)
          uns.splice(i, 1);
        if (added.includes(m))
          uns.push(un);
        return fs.writeFile(aliasDir + m, uns.join('\n'), {flag: 'w'});
      })
    );

    Promise.all(proms)
    .then(success)
    .catch(errorWith(0))
    .then(json(res));
  } else res.json(errorWith(1)());
});

module.exports = router;
