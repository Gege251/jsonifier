const fs   = require('fs-extra')
const ch   = require('./utils/change-manager')
const path = require('path')

const msg  = require('../lang/lang.js').getMessages()

module.exports = newFileToChange

async function newFileToChange (wdir, fileSrc) {
	const deployConfFile = path.join(wdir, '../.deployconf')

	if (!fileSrc) {
		console.log(msg.ERR_NO_FILE)
		return Promise.resolve(false)
	}

	if (!fs.existsSync(deployConfFile)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}
	const deployConf = fs.readJsonSync(deployConfFile)

	if (fs.existsSync(path.join(deployConf.source, fileSrc))) {
		console.log(msg.ERR_FILE_ALREADY_EXISTS)
		return Promise.resolve(false)
	}

  // Prepare directories in source
  fs.mkdirsSync(path.join(deployConf.source, path.dirname(fileSrc)))
  // Make an empty file
  fs.closeSync(fs.openSync(path.join(deployConf.source, fileSrc), 'a'))

  await ch.ensure(wdir)

  try {
    const dirs = [
      fs.mkdirs(path.join(wdir, deployConf.originalVersion, path.dirname(fileSrc))),
      fs.mkdirs(path.join(wdir, deployConf.editedVersion, path.dirname(fileSrc)))
    ]
    await Promise.all(dirs)
    const files = [
      fs.copy(path.join(deployConf.source, fileSrc), path.join(wdir, deployConf.originalVersion, fileSrc)),
      fs.copy(path.join(deployConf.source, fileSrc), path.join(wdir, deployConf.editedVersion, fileSrc))
    ]
    await Promise.all(files)

    console.log(msg.MSG_FILE_ADDED)

    ch.addFile(wdir, fileSrc)
    console.log(msg.MSG_CHANGES_UPDATED)
    return Promise.resolve(true)

  } catch(e) {
    console.log(msg.ERR_FILE_RW)
    return Promise.resolve(false)
  };

}
