const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory) {

	const inputFile = path.join(directory, 'changes.json');
	const configFile = path.join(directory, '../.deployconf');

	if (!fs.existsSync(inputFile)) {
		console.log('changes.json file doesn\'t exist.')
		return;
	}

	if (!fs.existsSync(configFile)) {
		console.log('Project folder is not initialized.')
		return;
	}

	var ifyconf = JSON.parse(fs.readFileSync(configFile, 'utf8'));

	fs.readFile(inputFile, 'utf8', (err, data) => {
		if (err) {
			console.log('File reading failed.');
			return;
		}

		var files = JSON.parse(data);

		files.forEach(file => {
			console.log('Copying: ' + path.join(ifyconf.source, file.path, file.filename));
			fs.mkdirsSync(path.join(directory, ifyconf.name, ifyconf.originalVersion, file.path));
			fs.mkdirsSync(path.join(directory, ifyconf.name, ifyconf.editedVersion, file.path));
			fs.copySync(path.join(ifyconf.source, file.path, file.filename), path.join(directory, ifyconf.name, ifyconf.originalVersion, file.path, file.filename));
			fs.copySync(path.join(ifyconf.source, file.path, file.filename), path.join(directory, ifyconf.name, ifyconf.editedVersion, file.path, file.filename));
		})
		console.log('Files copied.')
	});
}
