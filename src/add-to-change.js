const fs    = require('fs-extra')
const chman = require('./utils/change-manager')
const path  = require('path')

const msg	  = require('../lang/lang.js').getMessages()

module.exports = addToChange
  
async function addToChange(wdir, fileSrc) {
	const deployConfFile = path.join(wdir, '../.deployconf')

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

  await chman.ensure(wdir)

	if (await chman.fileExists(wdir, fileSrc)) {
		console.log(msg.ERR_FILE_ALREADY_ADDED)
		return Promise.resolve(false)
	}

  try {
	  const dirs = [
      fs.mkdirs(path.join(wdir, deployConf.originalVersion, path.dirname(fileSrc))),
		  fs.mkdirs(path.join(wdir, deployConf.editedVersion, path.dirname(fileSrc)))
    ]
    await Promise.all(dirs)
    const copies = [
		  fs.copy(path.join(deployConf.source, fileSrc), path.join(wdir, deployConf.originalVersion, fileSrc)),
		  fs.copy(path.join(deployConf.source, fileSrc), path.join(wdir, deployConf.editedVersion, fileSrc))
    ]
    await Promise.all(copies)
    console.log(msg.MSG_FILE_ADDED)

    await chman.addFile(wdir, fileSrc)
    console.log(msg.MSG_CHANGES_UPDATED)

    return Promise.resolve(true)

  } catch(e) {
    console.log(msg.ERR_FILE_RW)
    return Promise.resolve(false)
  }

}
