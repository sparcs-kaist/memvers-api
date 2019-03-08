const { exec, execSync } = require('child_process');
const { ldapHost } = require('../config/config.js');
const { adminPassword } = require('../config/local_config.js');

const shell = '/bin/sh';
const uid = parseInt(execSync('id -u nobody', { shell }));
const opt = { shell, uid };

function escape(str) {
  return str
    .replace(/\\/gi, '\\\\')
    .replace(/"/gi, '\\"')
    .replace(/\$/gi, '\\$');
}

const host = `-H ${ldapHost}`;
const admin = `-D "cn=admin,dc=sparcs,dc=org"`;
function dnOnly(un) { return `"uid=${escape(un)},ou=People,dc=sparcs,dc=org"`; }
function dn(un) { return '-D ' + dnOnly(un); }
function password(pw) { return `-w "${escape(pw)}"`; }
function newPassword(pw) { return `-s "${escape(pw)}"`; }
function file(path) { return `-f "${escape(path)}"`; }
const adminPass = password(adminPassword);

function e(params, cb) { exec(params.join(' '), opt, cb); }

function auth(un, pw) {
  let command = 'ldapwhoami';
  return new Promise((resolve, reject) => {
    if (un && pw)
      e([command, host, dn(un), password(pw)], (err, stdout, stderr) => {
        if (err || stdout.length === 0 || stderr.length !== 0)
          reject({command, err, stdout, stderr});
        else resolve();
      });
    else reject({command, un, pw});
  });
}

function passwd(un, opass, npass) {
  let command = 'ldappasswd';
  return new Promise((resolve, reject) => {
    if (un && opass && npass)
      e([command, host, dn(un), password(opass), newPassword(npass), '-S'], (err, stdout, stderr) => {
        if (err || stdout.length !== 0 || stderr.length !== 0)
          reject({command, err, stdout, stderr});
        else resolve();
      });
    else reject({command, un, opass, npass});
  });
}

function passwdByAdmin(un, npass) {
  let command = 'ldappasswd';
  return new Promise((resolve, reject) => {
    if (un && npass)
      e([command, host, admin, adminPass, newPassword(npass), '-S'], (err, stdout, stderr) => {
        if (err || stdout.length !== 0 || stderr.length !== 0)
          reject({command, err, stdout, stderr});
        else resolve();
      });
    else reject({command, un, npass});
  });
}

function uids() {
  let command = 'ldapsearch';
  return new Promise((resolve, reject) => {
    e([command, host, '-x -LLL -b "ou=People,dc=sparcs,dc=org" | grep uidNumber:'], (err, stdout, stderr) => {
      if (err || stderr.length !== 0)
        reject({command, err, stdout, stderr});
      else
        resolve(stdout.replace(/uidNumber: /gi, '').split('\n').map(parseInt));
    });
  });
}

function add(path) {
  let command = 'ldapadd';
  return new Promise((resolve, reject) => {
    if (path)
      e([command, host, admin, adminPass, file(path)], (err, stdout, stderr) => {
        if (err || stderr.length !== 0) reject({command, err, stdout, stderr});
        else resolve();
      });
    else reject({command, path});
  });
}

function del(un) {
  let command = 'ldapdelete';
  return new Promise((resolve, reject) => {
    if (un)
      e([command, host, admin, adminPass, dnOnly(un)], (err, stdout, stderr) => {
        if (err || stderr.length !== 0) reject({command, err, stdout ,stderr});
        else resolve();
      });
    else reject({command, un});
  });
}

function ldif(un, uid) {
  return [
    `dn: uid=${un},ou=People,dc=sparcs,dc=org`,
    `uid: ${un}`,
    `cn: ${un}`,
    'objectClass: account',
    'objectClass: posixAccount',
    'objectClass: top',
    'objectClass: shadowAccount',
    'shadowMax: 99999',
    'shadowWarning: 7',
    'loginShell: /bin/bash',
    `uidNumber: ${uid}`,
    'gidNumber: 400',
    `homeDirectory: /home/${un}`
  ].join('\n');
}

module.exports = {
  auth, passwd, passwdByAdmin, uids, add, del, ldif
};
