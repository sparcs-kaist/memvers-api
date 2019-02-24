const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { resetLength, dbHost, dbName, collectionName } = require('../config/config.js');

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

function initDB() {
  mongoose.connect('mongodb://' + dbHost + '/' + dbName);
}

module.exports = {
  initDB: initDB,
  ResetModel: ResetModel
};
