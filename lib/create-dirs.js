const fs = require('fs-extra');
const path = require('path');

const msg	= require('../lang/lang.js').getMessages();

module.exports = function(directory, fileSrc) {
	const deployConfFile = path.join(directory, '../.deployconf');

	if (!fs.existsSync(deployConfFile)) {
		console.log(deployConfFile);
		console.log(msg.ERR_NO_PROJECT);
		return;
	}
	var deployConf = fs.readJsonSync(deployConfFile);
	var subDirs = deployConf.otherDirs.concat([deployConf.originalVersion, deployConf.editedVersion]);

	subDirs.forEach(subDir => {
		fs.mkdirs(path.join(directory, subDir))
		.then(_ => {
			console.log(subDir, msg.MSG_CREATED);
		})
		.catch((err) => {
			console.log(msg.ERR_FILE_RW);
		})
	})

}
