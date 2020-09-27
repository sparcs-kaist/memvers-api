const { mailDbUrl } = require('../config/config.js');
const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize(mailDbUrl);

class MailingList extends Model {}
MailingList.init({
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  description: DataTypes.TEXT,
  owner: DataTypes.STRING(64),
  shown: DataTypes.BOOLEAN
});

class ForwardList extends Model {}
ForwardList.init({
  to: DataTypes.STRING(64),
  from: DataTypes.STRING(255)
}, {
  indexes: [
    { fields: ['from'] },
    { fields: ['to'] }
  ]
});

module.exports = {
  sequelize,
  ForwardList,
  MailingList
};
