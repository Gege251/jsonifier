const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

module.exports = function(directory) {
	const deployConfFile = path.join(directory, '../.deployconf');

	if (!fs.existsSync(deployConfFile)) {
		console.log('Project folder is not initialized.')
		return;
	}
	var deployConf = JSON.parse(fs.readFileSync(deployConfFile, 'utf8'));

	if (!fs.existsSync(path.join(directory))) {
		console.log('Change folder doesn\'t exist');
		result;
	}

	console.log('Archiving...')

	var date = new Date();
	var fileStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '_' + path.basename(directory);
	var archivePath = path.join(directory, '../', deployConf.archive, fileStr);

	fs.mkdirs(path.join(directory, '../', deployConf.archive, path.basename(directory)))
		.then(_ => {
			var counter = 0;
			while (fs.existsSync(archivePath + '.zip')) {
				counter++;
				archivePath = path.join(directory, '../', deployConf.archive, fileStr + '_' + counter);
			}
			archivePath += '.zip';

			var archiveFile =　fs.createWriteStream(archivePath);
			var archive = archiver('zip', {
				zlib: { level: 9 }
			});

			archiveFile.on('close', _ => {
				console.log('Archive created: ' +　archivePath);
			});
			archive.pipe(archiveFile);
			archive.directory(directory, false);
			archive.finalize();
		})

}
