const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

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
	var deployConf = fs.readJsonSync(deployConfFile);

	if (!fs.existsSync(changesFile)) {
		console.log(`Changes.json doesn't exist`);
		return;
	}
	var changesConf = fs.readJsonSync(changesFile);
	var changes = changesConf.changes;
	var changeIndex = changes.findIndex(file => { return path.join(file.path, file.filename) == path.join(fileDel) });

	if (changeIndex === -1) {
		console.log('File is not registered in the change');
		return;
	}

	// If the file has been edited since the add then ask for confirmation
	if (changes[changeIndex].added !== changes[changeIndex].changed) {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question('This file has been edited. Are you sure you want to delete it (press Y or N)? (using the "archive" first is advised)\n', answer => {
			rl.close();
			if (answer == 'y' || answer == 'Y') {
				removeFile();
			}
		});
	} else {
		removeFile();
	}

	function removeFile() {
		fs.remove(path.join(directory, deployConf.originalVersion, fileDel))
			.then(fs.remove(path.join(directory, deployConf.editedVersion, fileDel)))
			.then(_ => {
				console.log(fileDel, 'removed.');

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

				fs.writeJson(changesFile, changesConf, {spaces: 4} )
					.then(_ => console.log('changes.json successfully saved.'))
					.catch(err => console.log('File write error.'));
			})
			.catch(err => { console.log('File delete failed.') });

	}
}
