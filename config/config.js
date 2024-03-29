const localConfig = require('./local_config.js');

const defaultConfig = (process.env.NODE_ENV === 'production') ?
  {
    port: 80,
    // mailing list
    aliasDir: '/SPARCS/mail/aliases.d/',
    aliasWriteDir: '/SPARCS/mail/aliases.d/',
    aliasFile: '/etc/aliases',
    // forwarding
    homeDir: '/home/',
    // password reset
    resetLength: 50,
    resetTime: 30, // minutes
    resetLink: 'https://edalias.sparcs.org/',
    mailHost: '127.0.0.1',
    mailPort: 25,
    mailTo: 'sparcs.org',
    mailSubject: 'old.sparcs.org Password Reset',
    // session
    secure: false,
    maxAge: 180, // minutes
    // ldap
    ldapHost: 'ldap://ldap.sparcs.org',
    // db
    dbHost: '127.0.0.1',
    dbName: 'wedalias',
    collectionName: 'reset'
  } :
  {
    port: 80,
    // mailing list
    aliasDir: '/SPARCS/mail/aliases.d/',
    aliasWriteDir: '/SPARCS/mail/aliases.d/',
    aliasFile: '/etc/aliases',
    // forwarding
    homeDir: '/home/',
    // password reset
    resetLength: 10,
    resetTime: 1, // minutes
    resetLink: 'http://127.0.0.1/',
    mailHost: '127.0.0.1',
    mailPort: 25,
    mailTo: 'localhost',
    mailSubject: '[DEV] old.sparcs.org Password Reset',
    // session
    secure: false,
    maxAge: 600, // minutes
    // ldap
    ldapHost: 'ldap://ldap-server',
    // db
    dbHost: 'mongodb-server',
    dbName: 'wedalias',
    collectionName: 'reset'
  };

module.exports = Object.assign({}, defaultConfig, localConfig);
