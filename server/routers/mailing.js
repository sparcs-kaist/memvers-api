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
 * @apiSuccess {Object[]} all A complete list of mailing lists, containing id and desc
 * @apiSuccess {String[]} aliases A list of mailing lists, whom the user subscribed
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.get('/', (req, res) => {
  const un = req.session.un;

  const query = {};
  if (un !== 'wheel') query.shown = true;

  (async () => {
    const lists = await MailingList.findAll({
      where: query,
      order: [
        ['id', 'asc']
      ],
      attributes: [ 'id', 'description' ]
    });

    const all = lists.map(({ id, desc: description }) => ({ id, desc }));

    const aliases = (await ForwardList.findAll({
      where: {
        to: un
      }
    })).map(list => list.from);

    return successWith('all', all, 'aliases', aliases)();
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

  if(!Array.isArray(added) || !Array.isArray(removed)) {
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

router.use(auth.wheelOnly);

/**
 * @api {Get} /mailing/:name Get subscribed user of a mailing list
 * @apiName Aliases
 * @apiGroup Mailing
 * @apiDescription Get subscribed user of a mailing list
 *
 * @apiSuccess {String} id Name of the mailing list
 * @apiSuccess {String} desc Description of the mailing list
 * @apiSuccess {String[]} users A list of subscribed users
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Number} error The reason of the failure (
 * <code>undefined</code> if succeeded;
 * <code>0</code> if internal server error;
 * <code>1</code> if mailing list not found)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.get('/:name', (req, res) => {
  const listName = req.params.name;

  (async () => {
    const list = await MailingList.findOne({
      where: {
        id: listName
      }
    });

    if (!list) return errorWith(1)();

    const users = (await ForwardList.findAll({
      where: {
        from: listName
      }
    })).map(fwd => fwd.to);

    return successWith('id', list.id, 'desc', list.desc, 'users', users)();
  })()
  .catch(errorWith(0))
  .then(json(res));
});

/**
 * @api {Post} /mailing/:name Edit mailing list
 * @apiName Aliases
 * @apiGroup Mailing
 * @apiDescription Edit mailing list desc, add or remove subscribed user
 *
 * @apiParam {String} [desc] Updated description
 * @apiParam {String[]} [added] Subscribed users
 * @apiParam {String[]} [removed] Unsubscribed users
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 * @apiSuccess {Number} error The reason of the failure (
 * <code>undefined</code> if succeeded;
 * <code>0</code> if internal server error;
 * <code>1</code> if mailing list not found)
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.post('/:name', (req, res) => {
  const listName = req.params.name;

  (async () => {
    const transaction = await sequelize.transaction();

    try {
      const list = await MailingList.findOne({
        where: {
          id: listName
        }
      }, { transaction });

      if (!list) {
        await transaction.rollback();
        return errorWith(1)();
      }

      if (typeof req.body.desc === 'string') {
        await list.update({ desc: req.body.desc }), { transaction });
      }

      if (Array.isArray(req.body.added)) {
        for (const added of req.body.added) {
          await ForwardList.findOrCreate({
            where: {
              from: listName,
              to: added
            },

            transaction
          });
        }
      }

      if (Array.isArray(req.body.removed)) {
        for (const removed of req.body.removed) {
          await ForwardList.destroy({
            where: {
              from: listName,
              to: removed
            },

            transaction
          });
        }
      }
    } catch(err) {
      await transaction.rollback();
      throw err;
    }

    await transaction.commit();
    return success();
  })
  .catch(errorWith(0))
  .then(json(res));
});

/**
 * @api {Delete} /mailing/:name Delete mailing list
 * @apiName Aliases
 * @apiGroup Mailing
 * @apiDescription Delete mailing list desc, add or remove subscribed user
 *
 * @apiSuccess {Boolean} success Indicate whether succeeded
 *
 * @apiError (Error 401) Unauthorized Not logged in
 */
router.delete('/:name', (req, res) => {
  const listName = req.params.name;

  (async () => {
    const transaction = await sequelize.transaction();

    try {
      await MailingList.destroy({
        where: {
          id: listName
        },
        transaction
      });

      await ForwardList.destroy({
        where: {
          from: listName
        },

        transaction
      });
    } catch(err) {
      await transaction.rollback();
      throw err;
    }

    await transaction.commit();
    return success();
  })
  .catch(errorWith(0))
  .then(json(res));
});

module.exports = router;
