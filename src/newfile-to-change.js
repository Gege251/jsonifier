const fs = require('fs-extra');
const path = require('path');

const msg	= require('../lang/lang.js').getMessages();

module.exports = function(directory, fileSrc) {
	const changesFile = path.join(directory, 'changes.json');
	const deployConfFile = path.join(directory, '../.deployconf');

	if (!fileSrc) {
		console.log(msg.ERR_NO_FILE);
		return Promise.resolve(false);
	}

	if (!fs.existsSync(deployConfFile)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false);
	}
	var deployConf = fs.readJsonSync(deployConfFile);

	if (fs.existsSync(path.join(deployConf.source, fileSrc))) {
		console.log(msg.ERR_FILE_ALREADY_EXISTS);
		return Promise.resolve(false);
	}

  fs.mkdirsSync(path.join(deployConf.source, path.dirname(fileSrc)))
  fs.closeSync(fs.openSync(path.join(deployConf.source, fileSrc), 'a'))

	var changesConf;
	if (fs.existsSync(changesFile)) {
		changesConf = fs.readJsonSync(changesFile);
	} else {
		changesConf.name = path.basename(dirname);
    changesConf.title = "";
		changesConf.changes = [];
	}
	var changes = changesConf.changes;

	return fs.mkdirs(path.join(directory, deployConf.originalVersion, path.dirname(fileSrc)))
		.then(fs.mkdirs(path.join(directory, deployConf.editedVersion, path.dirname(fileSrc))))
		.then(fs.copy(path.join(deployConf.source, fileSrc), path.join(directory, deployConf.originalVersion, fileSrc)))
		.then(fs.copy(path.join(deployConf.source, fileSrc), path.join(directory, deployConf.editedVersion, fileSrc)))
		.then(_ => {
			console.log(msg.MSG_FILE_ADDED);

			var currentTime = new Date().toLocaleString();
			changes.push({
				filename: path.basename(fileSrc),
				path: path.dirname(fileSrc),
				added: currentTime,
				changed: currentTime,
			})

			return fs.writeJson(changesFile, changesConf, {spaces: 4})
		})
	 	.then(_ => {
			console.log(msg.MSG_CHANGES_UPDATED);
			return Promise.resolve(true)
		})
		.catch(err => {
			console.log(msg.ERR_FILE_RW)
			return Promise.resolve(false)
		});

}
