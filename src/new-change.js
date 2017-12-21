const fs         = require('fs-extra')
const ch         = require('./utils/change-manager')
const dp         = require('./utils/deployconf-manager')
const path       = require('path')
const createDirs = require('./create-dirs')

const msg	= require('../lang/lang.js').getMessages()

module.exports = newChange

async function newChange (wdir, chName, chTitle) {

  if (!chName) {
    console.log(msg.ERR_NO_CHANGE_NAME)
    return
  }

	if (! dp.exists(wdir)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}
	const dpConf = await dp.read(wdir)

  if ( ! /^[^<>:"\\\/\|\?\*]+$/.test(chName) ) {
    console.log(msg.ERR_INVALID_NAME)
    return
  }

  const chPath = path.join(wdir, chName)

  if (ch.exists(wdir)) {
    console.log(msg.ERR_CHANGE_ALREADY_EXISTS)
    return
  }

  try {
    await fs.mkdirs(chPath)
    await ch.create(chPath, chName, chTitle) 
    console.log(msg.MSG_CHANGE_CREATED)
    createDirs(path.join(chPath))
  } catch(e) {
    console.log(e)
    console.log(msg.ERR_FILE_RW)
  }

}
