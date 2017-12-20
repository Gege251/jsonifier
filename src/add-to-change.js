const fs    = require('fs-extra')
const chman = require('./utils/change-manager')
const path  = require('path')

const msg	  = require('../lang/lang.js').getMessages()

module.exports = async function(directory, fileSrc) {
	const deployConfFile = path.join(directory, '../.deployconf')

	if (!fileSrc) {
		console.log(msg.ERR_NO_FILE)
		return Promise.resolve(false)
	}

	if (!fs.existsSync(deployConfFile)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}
	var deployConf = fs.readJsonSync(deployConfFile);

	if (!fs.existsSync(path.join(deployConf.source, fileSrc))) {
		console.log(msg.ERR_NO_SOURCE)
		return Promise.resolve(false)
	}

	if (!fs.lstatSync(path.join(deployConf.source, fileSrc)).isFile() ) {
		console.log(msg.ERR_NOT_FILE)
		return Promise.resolve(false)
	}

  await chman.ensure(directory)

	if (await chman.fileExists(directory, fileSrc)) {
		console.log(msg.ERR_FILE_ALREADY_ADDED)
		return Promise.resolve(false)
	}

	return fs.mkdirs(path.join(directory, deployConf.originalVersion, path.dirname(fileSrc)))
		.then(fs.mkdirs(path.join(directory, deployConf.editedVersion, path.dirname(fileSrc))))
		.then(fs.copy(path.join(deployConf.source, fileSrc), path.join(directory, deployConf.originalVersion, fileSrc)))
		.then(fs.copy(path.join(deployConf.source, fileSrc), path.join(directory, deployConf.editedVersion, fileSrc)))
		.then(_ => {
			console.log(msg.MSG_FILE_ADDED)

      return chman.addFile(directory, fileSrc)

		})
	 	.then(_ => {
			console.log(msg.MSG_CHANGES_UPDATED)
			return Promise.resolve(true)
		})
		.catch(err => {
			console.log(msg.ERR_FILE_RW)
			return Promise.resolve(false)
		})

}
