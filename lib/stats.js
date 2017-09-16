const fs    = require('fs-extra');
const path  = require('path');
const chalk = require('chalk');
const { List, fromJS } = require('immutable')

const msg	= require('../lang/lang.js').getMessages();

module.exports = function (directory, report) {
  const orderBy = 'firstDate';

  const projectDir =
    fs.existsSync(path.join(directory, '.deployconf')) ? directory :
      fs.existsSync(path.join(directory, '../.deployconf')) ? path.join(directory, '../') : '';

	const deployConfFile = path.join(projectDir, '.deployconf');

	if (!fs.existsSync(deployConfFile)) {
		console.log(msg.ERR_NO_PROJECT)
		return;
	}
	var deployConf = fs.readJsonSync(deployConfFile);

  // Reading subdirectories and looking for changes.json files
  fs.readdir(projectDir)
    .then(entries =>
      // Reading all changes.json files asyncronously
      Promise.all(
        fromJS(entries)
          .filter(entry =>
            entry != '.deployconf'
            && entry != deployConf.archive
            && fs.lstatSync(path.join(projectDir, entry)).isDirectory()
            && fs.readdirSync(path.join(projectDir, entry)).includes('changes.json') )
          .map(entry =>
            fs.readJson(path.join(projectDir, entry, 'changes.json')))))

    // Get the first add date and the last edit date of changes
    .then(chFiles =>

      fromJS(chFiles)
        .map(chFile => chFile.set('firstDate',
          !chFile.get("changes") ? null :
              chFile.get('changes')
                .map(file => new Date(file.get('added')))
                .reduce((added1, added2) => Math.min(added1, added2))
              ))
        .map(chFile => chFile.set('lastDate',
          !chFile.get('changes') ? null :
            chFile.get('changes')
              .map(file => new Date(file.get('changed')))
              .reduce((added1, added2) => Math.max(added1, added2))
            ))
        .map(chFile => chFile.set('numOfFiles', chFile.get('changes').size ))
        .sort((chf1, chf2) => chf1.get(orderBy) - chf2.get(orderBy)))

    // Creating output
    // .then(entries => { console.log(entries); return entries }) // debug hook
    .then(changes => {
      if (report) {
        chalk.enabled = false;
      }

      const output = changes
        .map(change => List.of(
          chalk.yellow('\n' + change.get('name')) + (change.get('title') ? ' - ' + change.get('title') : ''),
          change.get('firstDate') ? ('\t' + msg.MSG_FIRST_ADDED + ' ' + new Date(change.get('firstDate')).toLocaleString()) : '',
          change.get('lastDate') ? ('\t' + msg.MSG_LAST_EDITED + ' ' + new Date(change.get('lastDate')).toLocaleString()) : '',
          '\t' + msg.MSG_EDITED_COUNT + ' ' + change.get('numOfFiles')
        ))
        .flatten()
        .filter(row => row)

      if (report) {
          fs.writeFile(path.join(directory, 'report.txt'), output.join('\r\n'))
    				.then(console.log(msg.MSG_REPORT_CREATED))
    				.catch(err => console.log(msg.ERR_FILE_RW));
      } else {
        console.log(output.join('\r\n'));
      }

    })
    .catch(err => console.log(err))

}
