const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const chokidar = require('chokidar');

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
      chokidar.watch(path.join(deployConf.source, change.path, change.filename)).on('change', watchedFile => {
        // make a hash of the file
        var readStream = fs.createReadStream(watchedFile);
        var hash = crypto.createHash('sha1');
        hash.setEncoding('hex');

        readStream.on('end', () => {
          hash.end();
          var fileHash = hash.read();

          // compare hash with the one in changes.json
          // if different save file to output, and the new hash to changes.json
          if (change.editedVersionHash !== fileHash) {
            fs.copy(watchedFile, path.join(directory, deployConf.editedVersion, change.path, change.filename))
              .then(() => {
                console.log(change.filename + ' saved.');
                change.editedVersionHash = fileHash;
                return fs.writeFile(changesFile, JSON.stringify(changes, null, 4))
              })
              .then(() => {
                console.log('changes.json saved.');
              })
              .catch(err => {
                console.log('IO error.');
              })

          }
        })
        readStream.pipe(hash);

      })
    })

    console.log('Watching for changes in ' + deployConf.source);

}
