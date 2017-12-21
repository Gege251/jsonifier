const fs    = require('fs-extra')
const dp    = require('./utils/deployconf-manager')
const ch    = require('./utils/change-manager')
const path  = require('path')
const chalk = require('chalk')
const { List, fromJS } = require('immutable')
const msg	= require('./lang/lang.js').getMessages()

module.exports = stats

async function stats (wdir, report) {
  const orderBy    = 'firstDate'
  const projectDir = dp.findProjectDir(wdir)

	if (! dp.exists(wdir)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}
	const dpConf = await dp.read(wdir)

  // Reading subdirectories and looking for changes files
  const chdirs = await fs.readdir(projectDir)

  // Reading every changes file asyncronously
  const chdocs = chdirs.filter(chdir =>
          chdir != dp.dpFileName()
          && chdir != dpConf.archive
          && fs.lstatSync(path.join(projectDir, chdir)).isDirectory()
          && fs.readdirSync(path.join(projectDir, chdir)).includes(ch.chFileName(wdir))
          ).map(chdir => ch.read(path.join(projectDir, chdir)))

  // Get the first add date and the last edit date of changes
  const changes = fromJS(await Promise.all(chdocs))
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
        .map(chFile => chFile.set('isLocked', chFile.get('lock')))
        .sort((chf1, chf2) => chf1.get(orderBy) - chf2.get(orderBy))

    // Creating output
    if (report) {
      chalk.enabled = false
    }

    const output = 
      changes.map(change => List.of(
        chalk.yellow('\n' + change.get('name')) + (change.get('title') ? ' - ' + change.get('title') : ''),
        change.get('firstDate') ? ('\t' + msg.MSG_FIRST_ADDED + ' ' + new Date(change.get('firstDate')).toLocaleString()) : '',
        change.get('lastDate') ? ('\t' + msg.MSG_LAST_EDITED + ' ' + new Date(change.get('lastDate')).toLocaleString()) : '',
        '\t' + msg.MSG_EDITED_COUNT + ' ' + change.get('numOfFiles'),
        change.get('isLocked') ? '\t' + msg.MSG_ISLOCKED : ''
      ))
      .flatten()
      .filter(row => row)

    if (report) {
      fs.writeFile(path.join(wdir, 'report.txt'), output.join('\r\n'))
        .then(console.log(msg.MSG_REPORT_CREATED))
        .catch(err => console.log(msg.ERR_FILE_RW))
    } else {
      console.log(output.join('\r\n'))
    }

}
