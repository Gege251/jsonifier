const fs    = require('fs-extra')
const ch    = require('./utils/change-manager')
const path  = require('path')
const dp    = require('./utils/deployconf-manager')

const msg	  = require('../lang/lang.js').getMessages()

module.exports = addToChange
  
async function addToChange(wdir, fileSrc) {
	if (!fileSrc) {
		console.log(msg.ERR_NO_FILE)
		return Promise.resolve(false)
	}

	if (! dp.exists(wdir)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}
	const dpConf = await dp.read(wdir)

	if (!fs.existsSync(path.join(dpConf.source, fileSrc))) {
		console.log(msg.ERR_NO_SOURCE)
		return Promise.resolve(false)
	}

	if (!fs.lstatSync(path.join(dpConf.source, fileSrc)).isFile() ) {
		console.log(msg.ERR_NOT_FILE)
		return Promise.resolve(false)
	}

  await ch.ensure(wdir)

	if (await ch.fileExists(wdir, fileSrc)) {
		console.log(msg.ERR_FILE_ALREADY_ADDED)
		return Promise.resolve(false)
	}

  try {
	  const dirs = [
      fs.mkdirs(path.join(wdir, dpConf.originalVersion, path.dirname(fileSrc))),
		  fs.mkdirs(path.join(wdir, dpConf.editedVersion, path.dirname(fileSrc)))
    ]
    await Promise.all(dirs)
    const copies = [
		  fs.copy(path.join(dpConf.source, fileSrc), path.join(wdir, dpConf.originalVersion, fileSrc)),
		  fs.copy(path.join(dpConf.source, fileSrc), path.join(wdir, dpConf.editedVersion, fileSrc))
    ]
    await Promise.all(copies)
    console.log(msg.MSG_FILE_ADDED)

    await ch.addFile(wdir, fileSrc)
    console.log(msg.MSG_CHANGES_UPDATED)

    return Promise.resolve(true)

  } catch(e) {
    console.log(msg.ERR_FILE_RW)
    return Promise.resolve(false)
  }

}
