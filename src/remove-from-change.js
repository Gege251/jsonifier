const fs       = require('fs-extra')
const path     = require('path')
const readline = require('readline')
const ch       = require('./utils/change-manager')

const msg      = require('../lang/lang.js').getMessages();

module.exports = removeFromChange

async function removeFromChange(wdir, fileDel) {
	const deployConfFile = path.join(wdir, '../.deployconf')

	if (!fileDel) {
		console.log(msg.ERR_NO_FILE)
		return Promise.resolve(false)
	}

	if (!fs.existsSync(deployConfFile)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}
	const deployConf = fs.readJsonSync(deployConfFile);

  await ch.ensure(wdir)

	if (! await ch.exists(wdir)) {
		console.log(msg.ERR_NO_CHANGESFILE)
		return Promise.resolve(false)
	}

	if (! await ch.fileExists(wdir, fileDel)) {
		console.log(msg.ERR_FILE_NOT_IN_CHANGE)
		return Promise.resolve(false)
	}

	// If the file has been edited since the add then ask for confirmation
	if (await ch.fileEdited(wdir, fileDel)) {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		return new Promise((resolve) =>
			rl.question(msg.INQ_FILE_DEL + '\n', answer => {
				rl.close()
				if (answer === 'y' || answer === 'Y') {
					resolve(removeFile())
				}
			})
		)
	} else {
		return removeFile()
	}

	async function removeFile() {
    try {
      const dirs = [
          fs.remove(path.join(wdir, deployConf.originalVersion, fileDel)),
          fs.remove(path.join(wdir, deployConf.editedVersion, fileDel))
      ]

      await Promise.all(dirs)
      console.log(fileDel, msg.MSG_FILE_DELETED);

      rmdirsRecur(
        path.join(wdir, deployConf.originalVersion), 
        path.join(wdir, deployConf.originalVersion, path.dirname(fileDel))
      )

      rmdirsRecur(
        path.join(wdir, deployConf.editedVersion), 
        path.join(wdir, deployConf.editedVersion, path.dirname(fileDel))
      )

      ch.removeFile(wdir, fileDel)
      console.log(msg.MSG_CHANGES_UPDATED);
      return Promise.resolve(true);
    } catch(e) {
      console.log(msg.ERR_FILE_RW)
      return Promise.resolve(false);
    }

	}
}

function rmdirsRecur(basedir, current) {
  if (current !== basedir && fs.readdirSync(current).length === 0) {
    fs.removeSync(current)
    rmdirsRecur(basedir, path.dirname(current))
  }
}
