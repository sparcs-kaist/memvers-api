const mongoose = require('mongoose');
const mysql = require('mysql');
const Schema = mongoose.Schema;
const { resetLength, dbHost, dbName, collectionName } = require('../config/config.js');
const { mysqlHost, mysqlName, mysqlUser, mysqlPassword } = require('../config/local_config.js');

function randChar() {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26));
}

function randStr() {
  let s = '';
  for (var i = 0; i < resetLength; i++) s += randChar();
  return s;
}

const resetSchema = new Schema({
  un: { type: String },
  serial: { type: String, default: randStr },
  date: { type: Date, default: Date.now }
});
const ResetModel = mongoose.model(collectionName, resetSchema);

const connection = mysql.createConnection({
  host: mysqlHost,
  database: mysqlName,
  user: mysqlUser,
  password: mysqlPassword
});

function initDB() {
  mongoose.connect('mongodb://' + dbHost + '/' + dbName);
  connection.connect();
}

function mysqlQuery(q, ps) {
  return new Promise((resolve, reject) =>
    connection.query(q, ps, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  );
}

module.exports = { initDB, ResetModel, mysqlQuery };
