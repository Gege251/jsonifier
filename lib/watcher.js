const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const chokidar = require('chokidar');
const Logger = require('./logger');

const msg	= require('../lang/lang.js').getMessages();

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
          console.log(msg.ERR_CHANGE_EMPTY);
          return;
        }

          changes
            .forEach(change => {
              chokidar.watch(path.join(deployConf.source, change.path, change.filename)).on('change', watchedFile => {
                // make a hash of the file

                fs.copy(watchedFile, path.join(directory, deployConf.editedVersion, change.path, change.filename))
                  .then(() => {
                    log(change.filename + ' ' + msg.MSG_SAVED);
                    change.changed = new Date().toLocaleString();
                    return fs.writeJson(changesFile, changesConf, {spaces: 4})
                  })
                  .then(() => {
                    log(msg.MSG_CHANGES_UPDATED);
                  })
                  .catch(err => {
                    log('IO error.');
                  })
              })
            })

            console.log(msg.MSG_WATCHING_START, deployConf.source);

            process.stdin.setEncoding('utf8');

            process.stdin.on('readable', () => {
              const chunk = process.stdin.read();
              if (chunk !== null && chunk.trim() === ':exit') {
                process.exit();
              }
            });

      })
      .catch(err => {
        console.log(err)
        console.log(msg.ERR_NO_CHANGESFILE);
      })

    })
    .catch(err => {
      console.log(msg.ERR_NO_PROJECT);
    })

}
