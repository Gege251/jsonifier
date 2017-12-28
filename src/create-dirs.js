const fs   = require('fs-extra')
const path = require('path')
const dp   = require('./utils/deployconf-manager')
const ch   = require('./utils/change-manager')
const msg  = require('./lang/lang.js').messages

module.exports = createDirs

async function createDirs(wdir) {

	if (! dp.exists(wdir)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}

   if (ch.exists(wdir)) {
     console.log(msg.ERR_CHANGE_ALREADY_EXISTS)
     return Promise.resolve(false)
   }
  
  const dpConf = dp.readSync(wdir)
  const dirs   = [
    dpConf.originalVersion,
    dpConf.editedVersion,
    ...dpConf.otherDirs
  ]

	const promises = dirs.map(async (subDir) => {
    try {
      await fs.mkdirs(path.join(wdir, subDir))
      console.log(subDir, msg.MSG_CREATED)
    } catch(err) {
			console.log(msg.ERR_FILE_RW)
		}
	})

  return Promise.all(promises)

}
