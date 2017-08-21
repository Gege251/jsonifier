const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory) {

	const deployConfFile = path.join(directory, '../.deployconf');

	if (!fs.existsSync(deployConfFile)) {
		console.log('Project folder is not initialized.')
		return;
	}
	var deployConf = JSON.parse(fs.readFileSync(deployConfFile, 'utf8'));

	if (!fs.existsSync(path.join(directory))) {
		console.log('Change folder doesn\'t exist');
		result;
	}

	var date = new Date();
	var dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
	var destinationPath = path.join(directory, '../', deployConf.archive, path.basename(directory), dateStr);
	var counter = 0;
	do {
		counter++;
	}
	while (fs.existsSync(destinationPath = path.join(directory, '../', deployConf.archive, path.basename(directory), dateStr + '_' + counter)))
	console.log(destinationPath);
	fs.copy(directory, destinationPath);

}