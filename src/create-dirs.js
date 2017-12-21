const fs   = require('fs-extra')
const dp   = require('./utils/deployconf-manager')
const path = require('path')

const msg  = require('../lang/lang.js').getMessages()

module.exports = createDirs

async function createDirs(wdir, fileSrc) {

	if (! dp.exists(wdir)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}
	const dpConf = await dp.read(wdir)

	const subDirs = [ ...dpConf.otherDirs, dpConf.originalVersion, dpConf.editedVersion]

	subDirs.forEach(subDir => {
		fs.mkdirs(path.join(wdir, subDir))
		.then(_ => {
			console.log(subDir, msg.MSG_CREATED)
		})
		.catch((err) => {
			console.log(msg.ERR_FILE_RW)
		})
	})

}
