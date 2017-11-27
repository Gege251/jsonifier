const fs = require('fs-extra');
const path = require('path');

const msg	= require('../lang/lang.js').getMessages();

module.exports = function(directory) {
	const changesFile = path.join(directory, 'changes.json');
	const deployConfFile = path.join(directory, '../.deployconf');

	if (!fs.existsSync(deployConfFile)) {
		console.log(msg.ERR_NO_PROJECT)
		return Promise.resolve(false);
	}
	const deployConf = fs.readJsonSync(deployConfFile);

	if (!fs.existsSync(changesFile)) {
		console.log(msg.ERR_NO_CHANGESFILE);
		return Promise.resolve(false);
	}
	const changesConf = fs.readJsonSync(changesFile);

	return fs.copy(path.join(directory, deployConf.originalVersion), path.join(deployConf.source))
		.then(_ => {
			console.log(msg.MSG_UNPATCHED);

			return fs.writeJson(changesFile, {...changesConf, lock: true}, {spaces: 4})
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
