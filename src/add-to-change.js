const fs    = require('fs-extra')
const path  = require('path')
const dp    = require('./utils/deployconf-manager')
const ch    = require('./utils/change-manager')
const msg   = require('./lang/lang.js').messages

async function addToChange(wdir, fileSrc) {
  return new Promise(async (resolveApp) => {
    if (!fileSrc) {
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

    if (!fs.existsSync(path.join(dpConf.source, fileSrc))) {
      console.log(msg.ERR_NO_SOURCE)
      resolveApp(false)
      return
    }

    if (!fs.lstatSync(path.join(dpConf.source, fileSrc)).isFile() ) {
      console.log(msg.ERR_NOT_FILE)
      resolveApp(false)
      return
    }

    await ch.ensure(wdir)

    if (await ch.fileExists(wdir, fileSrc)) {
      console.log(msg.ERR_FILE_ALREADY_ADDED)
      resolveApp(false)
      return
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

      resolveApp(true)
      return

    } catch(e) {
      console.log(msg.ERR_FILE_RW)
      resolveApp(false)
      return
    }
  })
}

module.exports = addToChange
