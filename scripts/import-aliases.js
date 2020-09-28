const { aliasDir, aliasWriteDir, aliasFile } = require('../config/config.js');
const { sequelize, ForwardList, MailingList } = require('../server/db.js');

const fs = require('fs');

(async () => {
  const isDryRun = process.argv[2] === 'dry-run';
  
  if (process.argv[2] !== 'exec' && !isDryRun) {
    console.log("Err: Unknown method\nUsage: node scripts/import-aliases.js [dry-run | exec]");
    return;
  }
  
  if (!isDryRun) await sequelize.sync();

  const aliasDirList = await fs.promises.readdir(aliasDir);
  const aliasContentRaw = await fs.promises.readFile(aliasFile, 'utf8');
  const aliasContent = [];

  for (const line of aliasContentRaw.split(/\r?\n/)) {
    const aliasMatch = line.match(/^([a-z0-9-]+):(.*)$/);
    if(!aliasMatch) continue;

    aliasContent.push(aliasMatch.slice(1));
  }

  console.log(`Found ${aliasContent.length} mailing lists`);

  for (const [ name, listRaw ] of aliasContent) {
    const users = [];
    const listParsed = listRaw.trim().split(',');
    for (const list of listParsed) {
      if (!list.trim()) continue;
      if (list.startsWith(':include:')) {
        const listFile = list.replace(/^:include:/, '');
        try {
          const includeContent = await fs.promises.readFile(listFile, 'utf8');
          const includeUsers = includeContent.split(/\r?\n/).map(v => v.trim()).filter(v => v && !v.startsWith('#'));

          users.push(...includeUsers);
          continue;
        } catch(err) {
          console.log(`${name}: Failed to open include: ${listFile}`);
          continue;
        }
      }

      users.push(list);
    }

    let description = '';
    try {
      description = await fs.promises.readFile(`${name}.info`, 'utf8');
    } catch(err) {}

    const shown = aliasDirList.includes(`${name}.template`);

    if (isDryRun) {
      console.log(`Dry Run: ${name}`);
      console.log(users.join('\n'));
      console.log();
      continue;
    }

    const transaction = await sequelize.transaction();
    try {
      await MailingList.create({
          id: name,
          description,
          owner: 'wheel',
          shown
        }, { transaction });

      for (const user of users) {
        await ForwardList.create({
          from: name,
          to: user
        }, { transaction });
      }

      await transaction.commit();
      console.log(`Imported ${name} with ${users.length} users`);
    } catch(err) {
      await transaction.rollback();
      console.error(`Failed to import aliases: ${name}`);
      console.error(err);
    }
  }
  console.log(`Done importing aliases`);
})();
