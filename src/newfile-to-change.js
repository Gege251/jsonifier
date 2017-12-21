const fs   = require('fs-extra')
const ch   = require('./utils/change-manager')
const dp   = require('./utils/deployconf-manager')
const path = require('path')

const msg  = require('../lang/lang.js').getMessages()

module.exports = newFileToChange

async function newFileToChange (wdir, fileSrc) {

	if (!fileSrc) {
		console.log(msg.ERR_NO_FILE)
		return Promise.resolve(false)
	}

	if (! dp.exists(wdir)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}
	const dpConf = await dp.read(wdir)

	if (fs.existsSync(path.join(dpConf.source, fileSrc))) {
		console.log(msg.ERR_FILE_ALREADY_EXISTS)
		return Promise.resolve(false)
	}

  // Prepare directories in source
  fs.mkdirsSync(path.join(dpConf.source, path.dirname(fileSrc)))
  // Make an empty file
  fs.closeSync(fs.openSync(path.join(dpConf.source, fileSrc), 'a'))

  await ch.ensure(wdir)

  try {
    const dirs = [
      fs.mkdirs(path.join(wdir, dpConf.originalVersion, path.dirname(fileSrc))),
      fs.mkdirs(path.join(wdir, dpConf.editedVersion, path.dirname(fileSrc)))
    ]
    await Promise.all(dirs)
    const files = [
      fs.copy(path.join(dpConf.source, fileSrc), path.join(wdir, dpConf.originalVersion, fileSrc)),
      fs.copy(path.join(dpConf.source, fileSrc), path.join(wdir, dpConf.editedVersion, fileSrc))
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
