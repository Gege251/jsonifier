const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory, fileDel) {
	const changesFile = path.join(directory, 'changes.json');
	const deployConfFile = path.join(directory, '../.deployconf');

	if (!fileDel) {
		console.log('File name must be passed by -n');
		return;
	}

	if (!fs.existsSync(deployConfFile)) {
		console.log('Project folder is not initialized.')
		return;
	}
	var deployConf = JSON.parse(fs.readFileSync(deployConfFile, 'utf8'));

	if (!fs.existsSync(changesFile)) {
		console.log('Changes.json doesn\t exist');
		return;
	}
	var changes = JSON.parse(fs.readFileSync(changesFile, 'utf8'));
	var changeIndex = changes.findIndex(file => { return path.join(file.path, file.filename) == path.join(fileDel) });

	if (changeIndex === -1) {
		console.log('File is not registered in the change');
		return;
	}

	// If the file has been edited since the add then ask for confirmation
	if (changes[changeIndex].originalVersionHash !== changes[changeIndex].editedVersionHash) {
		console.log('This file has been edited. Are you sure you want to delete it? (using the "archive" option is advised instead)');
		// TODO
		return;
	}

	fs.removeSync(path.join(directory, deployConf.originalVersion, fileDel));
	fs.removeSync(path.join(directory, deployConf.editedVersion, fileDel));

	var pathRemains = path.join(directory, deployConf.originalVersion, path.dirname(fileDel));
	while (pathRemains !== path.join(directory, deployConf.originalVersion) && fs.readdirSync(pathRemains).length == 0) {
		fs.removeSync(pathRemains);
		pathRemains = path.dirname(pathRemains);
	}

	pathRemains = path.join(directory, deployConf.editedVersion, path.dirname(fileDel));
	while (pathRemains !== path.join(directory, deployConf.editedVersion) && fs.readdirSync(pathRemains).length == 0) {
		fs.removeSync(pathRemains);
		pathRemains = path.dirname(pathRemains);
	}

	changes.splice(changeIndex, 1);

	fs.writeFile(changesFile, JSON.stringify(changes, null, 4), err => {
		if (!err) {
			console.log('changes.json successfully saved.');
		} else {
			console.log('File write error.')
		}
	});
}
