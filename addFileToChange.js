const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory, fileSrc) {

	const changesFile = path.join(directory, 'changes.json');
	const deployConfFile = path.join(directory, '../.deployconf');

	console.log(deployConfFile)
	if (!fs.existsSync(deployConfFile)) {
		console.log('Project folder is not initialized.')
		return;
	}
	var deployConf = JSON.parse(fs.readFileSync(deployConfFile, 'utf8'));

	if (!fs.existsSync(path.join(deployConf.source, fileSrc))) {
		console.log('Source file doesn\'t exist');
		return;
	}


	var changes = [];
	if (fs.existsSync(changesFile)) {
		changes = JSON.parse(fs.readFileSync(changesFile, 'utf8'));
	}

	fs.mkdirsSync(path.join(directory, deployConf.originalVersion, path.dirname(fileSrc)));
	fs.mkdirsSync(path.join(directory, deployConf.editedVersion, path.dirname(fileSrc)));
	fs.copySync(path.join(deployConf.source, fileSrc), path.join(directory, deployConf.originalVersion, fileSrc));
	fs.copySync(path.join(deployConf.source, fileSrc), path.join(directory, deployConf.editedVersion, fileSrc));
	console.log('Files copied.');

	changes.push({
		filename: path.basename(fileSrc),
		path: path.dirname(fileSrc)
	})

	fs.writeFile(changesFile, JSON.stringify(changes, null, 4), err => {
		if (!err) {
			console.log('changes.json successfully saved.');
		} else {
			console.log('File write error.')
		}
	});
}
