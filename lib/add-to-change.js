const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory, fileSrc) {
	const changesFile = path.join(directory, 'changes.json');
	const deployConfFile = path.join(directory, '../.deployconf');

	if (!fileSrc) {
		console.log('File name must be passed');
		return;
	}

	if (!fs.existsSync(deployConfFile)) {
		console.log('Project folder is not initialized.')
		return;
	}
	var deployConf = fs.readJsonSync(deployConfFile);

	if (!fs.existsSync(path.join(deployConf.source, fileSrc))) {
		console.log('Source file doesn\'t exist');
		return;
	}

	if (!fs.lstatSync(path.join(deployConf.source, fileSrc)).isFile() ) {
		console.log('The given source is not a file.');
		return;
	}

	var changesConf;
	if (fs.existsSync(changesFile)) {
		changesConf = fs.readJsonSync(changesFile);
	} else {
		changesConf.name = path.basename(dirname);
		changesConf.changes = [];
	}
	var changes = changesConf.changes;

	if (changes.some(file => path.join(file.path, file.filename) === path.join(fileSrc) )) {
		console.log('File is already added to the change');
		return;
	}

	fs.mkdirs(path.join(directory, deployConf.originalVersion, path.dirname(fileSrc)))
		.then(fs.mkdirs(path.join(directory, deployConf.editedVersion, path.dirname(fileSrc))))
		.then(fs.copy(path.join(deployConf.source, fileSrc), path.join(directory, deployConf.originalVersion, fileSrc)))
		.then(fs.copy(path.join(deployConf.source, fileSrc), path.join(directory, deployConf.editedVersion, fileSrc)))
		.then(_ => {
			console.log('File added.');

			var currentTime = new Date().toLocaleString();
			changes.push({
				filename: path.basename(fileSrc),
				path: path.dirname(fileSrc),
				added: currentTime,
				changed: currentTime,
			})

			return fs.writeJson(changesFile, changesConf, {spaces: 4})
		})
	 	.then(_ => console.log('changes.json successfully saved.'))
		.catch(err => console.log('File write error.'));

}
