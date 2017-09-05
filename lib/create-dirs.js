const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory, fileSrc) {
	const deployConfFile = path.join(directory, '../.deployconf');

	if (!fs.existsSync(deployConfFile)) {
		console.log(deployConfFile);
		console.log('Project folder is not initialized.');
		return;
	}
	var deployConf = fs.readJsonSync(deployConfFile);
	var subDirs = deployConf.otherDirs.concat([deployConf.originalVersion, deployConf.editedVersion]);

	subDirs.forEach(subDir => {
		fs.mkdirs(path.join(directory, subDir))
		.then(_ => {
			console.log(subDir + ' created.');
		})
		.catch((err) => {
			console.log('IO Error.');
		})
	})

}
