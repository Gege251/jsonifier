const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const msg	= require('../lang/lang.js').getMessages();

module.exports = function(directory, fileDel) {
	const changesFile = path.join(directory, 'changes.json');
	const deployConfFile = path.join(directory, '../.deployconf');

	if (!fileDel) {
		console.log(msg.ERR_NO_FILE);
		return Promise.resolve(false);
	}

	if (!fs.existsSync(deployConfFile)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false);
	}
	var deployConf = fs.readJsonSync(deployConfFile);

	if (!fs.existsSync(changesFile)) {
		console.log(msg.ERR_NO_CHANGESFILE);
		return Promise.resolve(false);
	}
	var changesConf = fs.readJsonSync(changesFile);
	var changes = changesConf.changes;
	var changeIndex = changes.findIndex(file => { return path.join(file.path, file.filename) == path.join(fileDel) });

	if (changeIndex === -1) {
		console.log(msg.ERR_FILE_NOT_IN_CHANGE);
		return Promise.resolve(false);
	}

	// If the file has been edited since the add then ask for confirmation
	if (changes[changeIndex].added !== changes[changeIndex].changed) {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		return new Promise((resolve, reject) =>
			rl.question(msg.INQ_FILE_DEL + '\n', answer => {
				rl.close();
				if (answer == 'y' || answer == 'Y') {
					resolve(removeFile());
				}
			})
		)
	} else {
		return removeFile();
	}

	function removeFile() {
		return fs.remove(path.join(directory, deployConf.originalVersion, fileDel))
			.then(fs.remove(path.join(directory, deployConf.editedVersion, fileDel)))
			.then(_ => {
				console.log(fileDel, msg.MSG_FILE_DELETED);

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

				return fs.writeJson(changesFile, changesConf, {spaces: 4} )
			})
			.then(_ => {
				console.log(msg.MSG_CHANGES_UPDATED);
				return Promise.resolve(true);
			})
			.catch(err => {
				console.log(msg.ERR_FILE_RW)
				return Promise.resolve(false);
			});

	}
}
