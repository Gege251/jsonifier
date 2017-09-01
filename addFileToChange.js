const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory, fileSrc) {
	const changesFile = path.join(directory, 'changes.json');
	const deployConfFile = path.join(directory, '../.deployconf');

	if (!fileSrc) {
		console.log('File name must be passed by -n');
		return;
	}

	if (!fs.existsSync(deployConfFile)) {
		console.log('Project folder is not initialized.')
		return;
	}
	var deployConf = JSON.parse(fs.readFileSync(deployConfFile, 'utf8'));

	if (!fs.existsSync(path.join(deployConf.source, fileSrc))) {
		console.log('Source file doesn\'t exist');
		return;
	}

	if (!fs.lstatSync(path.join(deployConf.source, fileSrc)).isFile() ) {
		console.log('The given source is not a file.');
		return;
	}

	var changes = [];
	if (fs.existsSync(changesFile)) {
		changes = JSON.parse(fs.readFileSync(changesFile, 'utf8'));
	}

	if (changes.some(file => { return path.join(file.path, file.filename) === path.join(fileSrc) })) {
		console.log('File is already added to the change');
		return;
	}

	fs.mkdirs(path.join(directory, deployConf.originalVersion, path.dirname(fileSrc)))
		.then(fs.mkdirs(path.join(directory, deployConf.editedVersion, path.dirname(fileSrc))))
		.then(fs.copy(path.join(deployConf.source, fileSrc), path.join(directory, deployConf.originalVersion, fileSrc)))
		.then(fs.copy(path.join(deployConf.source, fileSrc), path.join(directory, deployConf.editedVersion, fileSrc)))
		.then(_ => {
			console.log('File added.');

			// Creating hash
			var readStream = fs.createReadStream(path.join(deployConf.source, fileSrc));

			var currentTime = new Date().toLocaleString();
			changes.push({
				filename: path.basename(fileSrc),
				path: path.dirname(fileSrc),
				added: currentTime,
				changed: currentTime,
			})

			fs.writeFile(changesFile, JSON.stringify(changes, null, 4), err => {
				if (!err) {
					console.log('changes.json successfully saved.');
				} else {
					console.log('File write error.')
				}
			});

		})
		.catch((err) => {
			console.log('IO Error.');
		})

}
