const auth = require('../auth.js');
const express = require('express');
const fs = require('fs').promises;
const { success, successWith, errorWith, failure, json } = require('../response.js');

const { sequelize, ForwardList, MailingList } = require('../db.js');

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
 * <code>2</code> if <code>desc</code> is not given;
 * <code>3</code> if <code>name</code> is invalid)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */

const listRegex = /^[a-zA-Z0-9-_]{2,}$/g;
router.put('/:name', (req, res) => {
  const un = req.session.un;
  const listName = decodeURIComponent(req.params.name);
  const description = req.body.desc;

  if (!description) {
    res.json(errorWith(2)());
    return;
  }

  if (!listRegex.test(listName)) {
    res.json(errorWith(3)());
    return;
  }

  (async () => {
    const transaction = await sequelize.transaction();
    try {
      await MailingList.create({
          id: listName,
          description: `${(new Date()).toISOString().substring(0, 10)}, by ${un}, ${description}`,
          owner: un,
          shown: true
        }, { transaction });

      await ForwardList.create({
        from: listName,
        to: 'mail-archive'
      }, { transaction });

      await ForwardList.create({
        from: listName,
        to: un
      }, { transaction });

      transaction.commit();
    } catch(err) {
      await transaction.rollback();
      throw err;
    }
  })()
  .then(success)
  .catch(errorWith(1))
  .then(json(res));
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
  const un = req.session.un;

  (async () => {
    const lists = await MailingList.findAll({
      where: {
        shown: true
      },
      order: [
        ['id', 'asc']
      ],
      attributes: [ 'id', 'description' ]
    });

    const all = lists.map(list => list.id);
    const info = lists.reduce((objects, { id, description }) => {
      objects[id] = description;
      return objects;
    }, Object.create(null));

    const aliases = (await ForwardList.findAll({
      where: {
        to: un
      }
    })).map(list => list.from);

    return successWith('all', all, 'info', info, 'aliases', aliases)();
  })()
  .catch(failure)
  .then(json(res));
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
 * <code>1</code> if <code>added</code> or <code>removed</code> is not given;
 * <code>2</code> if mailing list not found)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.post('/', (req, res) => {
  const un = req.session.un;
  const { added, removed } = req.body;

  if(!added || !removed) {
    res.json(errorWith(1));
    return;
  }

  (async () => {
    const transaction = await sequelize.transaction();
    try {
      for (const listName of added) {
        const list = await MailingList.findOne({
          where: {
            id: listName
          },
          transaction
        });

        if(!list) {
          await transaction.rollback();
          return false;
        }

        await ForwardList.findOrCreate({
          where: {
            from: listName,
            to: un
          },
          transaction
        });
      }

      for (const listName of removed) {
        await ForwardList.destroy({
          where: {
            from: listName,
            to: un
          },

          transaction
        });
      }

      await transaction.commit();
      return true;
    } catch(err) {
      await transaction.rollback();
      throw err;
    }
  })()
  .then(isSuccess => {
    if (isSuccess) {
      return success();
    }

    return errorWith(2)();
  })
  .catch(errorWith(0))
  .then(json(res));
});

module.exports = router;
