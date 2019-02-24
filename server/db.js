const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
const ResetModel = mongoose.model('resets', resetSchema);

function initDB() {
  mongoose.connect('mongodb://127.0.0.1/wedalias');
}

module.exports = {
    initDB: initDB,
    ResetModel: ResetModel
};
