const fs       = require('fs-extra')
const path     = require('path')
const archiver = require('archiver')
const dp       = require('./utils/deployconf-manager')
const msg	     = require('./lang/lang.js').messages

module.exports = archive

async function archive(wdir) {

	if (! dp.exists(wdir)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false)
	}
	const dpConf = await dp.read(wdir)
  
	if (!fs.existsSync(path.join(wdir))) {
		console.log(msg.ERR_NO_CHANGESFOLDER)
		return
	}

	console.log(msg.MSG_ARCHIVE_START)

  const archiveDir = dp.findArchiveDir(wdir)

	await fs.mkdirs(archiveDir)

  return new Promise((resolve, reject) => {

    const currentDate = new Date(Date.now())
    const basename    = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate() + '_' + path.basename(wdir)

    const archivePath = genUniquePath(archiveDir, basename)
    const archiveFile = fs.createWriteStream(archivePath)
    const archive     = archiver('zip', { zlib: { level: 9 } })

    archiveFile.on('warning', err => {
      if (err.code === 'ENOENT') {
        console.log('warning')
      } else {
        reject()
      }
    })

    archiveFile.on('close', _ => {
      console.log(msg.MSG_ARCHIVE_COMPLETED,　archivePath)
      resolve()
    })

    archive.pipe(archiveFile)
    archive.directory(wdir, false)
    archive.finalize()
  })
}

function genUniquePath(filepath, basename, seq = 0) {
  const filename = basename + (seq !== 0 ? String(seq) : '') + '.zip'
  const fullpath = path.join(filepath, filename)

  if (!fs.existsSync(fullpath)) {
    return fullpath
  } else {
    return genUniquePath(filepath, basename, (seq + 1))
  }
}
