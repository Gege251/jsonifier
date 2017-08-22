const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory) {
  const changesFile = path.join(directory, 'changes.json');
	const deployConfFile = path.join(directory, '../.deployconf');

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

  changes
    .forEach(change => {
      fs.watch(path.join(deployConf.source, change.path, change.filename), (e, file) => {
      console.log(e);
      console.log(file);
        // make a hash of the file
        // compare hash with the one in changes.json
        // if different save file to output
        fs.copy(path.join(deployConf.source, change.path, change.filename), path.join(directory, deployConf.editedVersion, change.path, change.filename))
          .then(e => { console.log('file saved');});
      });
    })

}
