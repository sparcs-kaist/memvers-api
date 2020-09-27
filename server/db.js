const mongoose = require('mongoose');
const mysql = require('mysql');
const Schema = mongoose.Schema;
const { Sequelize, Model, DataTypes } = require('sequelize');
const {
  resetLength, dbHost, dbName, collectionName,
  mailDbUrl,
  mysqlHost, mysqlName, mysqlUser, mysqlPassword
} = require('../config/config.js');

function randChar() {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26));
}

function randStr() {
  let s = '';
  for (var i = 0; i < resetLength; i++) s += randChar();
  return s;
}

// Memvers Own DB
const resetSchema = new Schema({
  un: { type: String },
  serial: { type: String, default: randStr },
  date: { type: Date, default: Date.now }
});
const ResetModel = mongoose.model(collectionName, resetSchema);

// Mailserver DB
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
}, { sequelize });

class ForwardList extends Model {}
ForwardList.init({
  to: DataTypes.STRING(64),
  from: DataTypes.STRING(255)
}, {
  indexes: [
    { fields: ['from'] },
    { fields: ['to'] }
  ],
  sequelize,
  tableName: 'forwards'
});

// Nugu DB
const pool = mysql.createPool({
  host: mysqlHost,
  database: mysqlName,
  user: mysqlUser,
  password: mysqlPassword
});

function initDB() {
  mongoose.connect('mongodb://' + dbHost + '/' + dbName, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function initMailserverDB() {
  await sequelize.sync();
}

function mysqlQuery(q, ps) {
  return new Promise((resolve, reject) =>
    pool.query(q, ps, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  );
}

module.exports = {
  initDB,
  initMailserverDB,
  ResetModel,
  MailingList,
  ForwardList,
  sequelize,
  mysqlQuery
};
