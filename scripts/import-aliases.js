const { aliasDir, aliasWriteDir, aliasFile } = require('../config/config.js');
const { sequelize, ForwardList, MailingList } = require('../server/alias.js');

const fs = require('fs');

(async () => {
  const isDryRun = process.argv[2] === 'dry-run' ?
    true :
    (
      process.argv[2] === 'exec' ?
      false :
      (
        return console.log("Err: Unknown method\nUsage: node scripts/import-aliases.js [dry-run | exec]")
      )
    );

  const aliasDirList = await fs.promises.readdir(aliasDir);
  const aliasContentRaw = await fs.promises.readFile(aliasFile, 'utf8');
  const aliasContent = [];

  for (const line of aliasContentRaw.split(/\r?\n/)) {
    const aliasMatch = line.match(/^([a-z0-9-]+):(.*)$/);
    if(!aliasMatch) return null;

    aliasContent.push(aliasMatch.slice(1));
  }

  console.log(`Found ${aliasContent.length} mailing lists`);

  for (const [ name, listRaw ] of aliasContent) {
    const users = [];
    const listParsed = listRaw.trim().split(',');
    for (const list of listParsed) {
      if (list.startsWith(':include:')) {
        const includeContent = await fs.promises.readFile(list, 'utf8');
        const includeUsers = list.split(/\r?\n/).map(v => v.trim()).filter(v => v && !v.startsWith('#'));

        users.push(...includeContent);
        continue;
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

      console.log(`Imported ${name} with ${users.length} users`);
    } catch(err) {
      await transaction.rollback();
      console.error(`Failed to import aliases: ${name}`);
      console.error(err);
    }
  }
  console.log(`Done importing aliases`);
})();
