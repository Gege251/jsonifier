const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const chokidar = require('chokidar');
const Logger = require('./logger');

module.exports = function(directory) {
  const changesFile = path.join(directory, 'changes.json');
	const deployConfFile = path.join(directory, '../.deployconf');

  fs.open(deployConfFile, 'r')
    .then(fd => { return fs.readJson(fd) })
    .then(deployConf => {
        const logger = new Logger(deployConf.logging ? path.join(directory, 'changes.log') : null);
        const log = logger.log;

      fs.open(changesFile, 'r+')
      .then(fd => { return fs.readJson(fd) })
      .then(changesConf => {
        let changes = changesConf.changes;
        if (changes.length < 1) {
          console.log('No files to watch.')
          return;
        }
        
          changes
            .forEach(change => {
              chokidar.watch(path.join(deployConf.source, change.path, change.filename)).on('change', watchedFile => {
                // make a hash of the file

                fs.copy(watchedFile, path.join(directory, deployConf.editedVersion, change.path, change.filename))
                  .then(() => {
                    log(change.filename + ' saved.');
                    change.changed = new Date().toLocaleString();
                    return fs.writeJson(changesFile, changesConf, {spaces: 4})
                  })
                  .then(() => {
                    log('changes.json saved.');
                  })
                  .catch(err => {
                    log('IO error.');
                  })
              })
            })

            console.log('Watching for changes in ' + deployConf.source);
      })
      .catch(err => {
        console.log(err)
        console.log(`Changes.json doesn't exist`);
      })

    })
    .catch(err => {
      console.log('Project folder is not initialized.')
    })

}
