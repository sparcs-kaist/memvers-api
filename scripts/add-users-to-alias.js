const { aliasDir } = require('../config/config.js');
const { sequelize, ForwardList, MailingList } = require('../server/db.js');

const fs = require('fs');

(async () => {
  const isDryRun = process.argv[2] === 'dry-run';
  const alias = process.argv[3];
  const file = process.argv[4];
  
  if (process.argv[2] !== 'exec' && !isDryRun) {
    console.log("Err: Unknown method\nUsage: node scripts/add-users-to-alias.js [dry-run | exec] [aliasname] [file]");
    return;
  }
  
  if (!isDryRun) await sequelize.sync();
  
  const usersRaw = await fs.promises.readFile(file, 'utf8');
  const users = [];
  
  for (const line of usersRaw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    
    users.push(line.trim());
  }

  console.log(`Found ${users.length} users`);

  if (isDryRun) {
    console.log(`Dry Run: ${alias}`);
    console.log(users.join('\n'));
    console.log();
    return;
  }

  const transaction = await sequelize.transaction();
  try {
    for (const user of users) {
      await ForwardList.create({
        from: alias,
        to: user
      }, { transaction });
    }

    await transaction.commit();
    console.log(`Imported ${alias} with ${users.length} users`);
  } catch(err) {
    await transaction.rollback();
    console.error(`Failed to import aliases: ${name}`);
    console.error(err);
  }
})();
