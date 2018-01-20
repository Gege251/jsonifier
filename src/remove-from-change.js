const fs         = require('fs-extra')
const path       = require('path')
const dp         = require('./utils/deployconf-manager')
const ch         = require('./utils/change-manager')
const areyousure = require('./utils/areyousure')
const msg        = require('./lang/lang.js').messages

function rmdirsRecur(basedir, current) {
  if (current !== basedir && fs.readdirSync(current).length === 0) {
    fs.removeSync(current)
    rmdirsRecur(basedir, path.dirname(current))
  }
}

async function removeFromChange(wdir, fileDel) {
  return new Promise(async (resolveApp) => {

    if (!fileDel) {
      console.log(msg.ERR_NO_FILE)
      resolveApp(false)
      return
    }

    if (! dp.exists(wdir)) {
      console.log(msg.ERR_NO_PROJECT)
      resolveApp(false)
      return
    }
    const dpConf = await dp.read(wdir)

    await ch.ensure(wdir)

    if (! await ch.exists(wdir)) {
      console.log(msg.ERR_NO_CHANGESFILE)
      resolveApp(false)
      return
    }

    if (! await ch.fileExists(wdir, fileDel)) {
      console.log(msg.ERR_FILE_NOT_IN_CHANGE)
      resolveApp(false)
      return
    }

    // If the file has been edited confirm
    if (await ch.fileEdited(wdir, fileDel)) {
      return areyousure(msg.INQ_FILE_DEL, removeFile) 
    } else {
      return removeFile()
    }

    async function removeFile() {
      try {
        const dirs = [
            fs.remove(path.join(wdir, dpConf.originalVersion, fileDel)),
            fs.remove(path.join(wdir, dpConf.editedVersion, fileDel))
        ]

        await Promise.all(dirs)
        console.log(fileDel, msg.MSG_FILE_DELETED)

        rmdirsRecur(
          path.join(wdir, dpConf.originalVersion), 
          path.join(wdir, dpConf.originalVersion, path.dirname(fileDel))
        )

        rmdirsRecur(
          path.join(wdir, dpConf.editedVersion), 
          path.join(wdir, dpConf.editedVersion, path.dirname(fileDel))
        )

        await ch.removeFile(wdir, fileDel)
        console.log(msg.MSG_CHANGES_UPDATED)
        resolveApp(true)
        return
      } catch(e) {
        console.log(msg.ERR_FILE_RW)
        resolveApp(false)
        return
      }

    }
  })
}

module.exports = removeFromChange
