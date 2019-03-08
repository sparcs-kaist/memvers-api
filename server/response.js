const assert = require('assert');
const log = require('./log.js');

function objWith(...args) {
  assert(args.length % 2 === 0);
  let obj = {};
  for (let i = 0; i < args.length; i += 2)
    obj[args[i]] = args[i + 1];
  return () => obj;
}

function successWith(...args) {
  return objWith(...args, 'success', true);
}

const success = successWith();

function failureWith(...args) {
  return err => {
    log.error(err);
    return objWith(...args, 'success', false)();
  };
}

const failure = failureWith();

function errorWith(err, ...args) {
  return failureWith(...args, 'error', err);
}

function json(res) { return j => res.json(j); }

module.exports = { objWith, successWith, failureWith, errorWith, success, failure, json };
