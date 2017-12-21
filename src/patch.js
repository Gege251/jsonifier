const fs   = require('fs-extra')
const path = require('path')
const ch   = require('./utils/change-manager')

const msg  = require('../lang/lang.js').getMessages()

module.exports = patch

async function patch(wdir) {
	const deployConfFile = path.join(wdir, '../.deployconf')

	if (!fs.existsSync(deployConfFile)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}
	const deployConf = fs.readJsonSync(deployConfFile)

	if (! await ch.exists(wdir)) {
		console.log(msg.ERR_NO_CHANGESFILE)
		return Promise.resolve(false)
	}

  try {
    await fs.copy(path.join(wdir, deployConf.editedVersion), path.join(deployConf.source))
    console.log(msg.MSG_PATCHED)

    await ch.unlock(wdir)
    console.log(msg.MSG_CHANGES_UPDATED)
    return Promise.resolve(true)
  } catch (err) {
    console.log(msg.ERR_FILE_RW)
    return Promise.resolve(false)
  }

}
