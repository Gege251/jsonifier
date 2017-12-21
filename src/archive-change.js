const fs       = require('fs-extra')
const path     = require('path')
const archiver = require('archiver')
const dp       = require('./utils/deployconf-manager')
const msg      = require('./lang/lang.js').getMessages()

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

	const date = new Date()
	const fileStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '_' + path.basename(wdir)
	let archivePath = path.join(wdir, '../', dpConf.archive, fileStr)

	fs.mkdirs(path.join(wdir, '../', dpConf.archive, path.basename(wdir)))
		.then(_ => {
			let counter = 0
			while (fs.existsSync(archivePath + '.zip')) {
				counter++
				archivePath = path.join(wdir, '../', dpConf.archive, fileStr + '_' + counter)
			}
			archivePath += '.zip'

			const archiveFile =　fs.createWriteStream(archivePath)
			const archive     = archiver('zip', {
				zlib: { level: 9 }
			})

			archiveFile.on('close', _ => {
				console.log(msg.MSG_ARCHIVE_COMPLETED,　archivePath)
			})
			archive.pipe(archiveFile)
			archive.directory(wdir, false)
			archive.finalize()
		})

}
