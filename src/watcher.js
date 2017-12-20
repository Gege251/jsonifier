const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const logger = new (require('./logger'))();

module.exports = function(directory) {
  const msg	= require('../lang/lang.js').getMessages();
  const log = logger.log;
  const changesFile = path.join(directory, 'changes.json');
	const deployConfFile = path.join(directory, '../.deployconf');
  let watchers;

  fs.open(deployConfFile, 'r')
    .then(fd => { return fs.readJson(fd) })
    .then(deployConf => {
      logger.setLogFile(deployConf.logging ? path.join(directory, 'changes.log') : null);

      fs.open(changesFile, 'r+')
      .then(fd => fs.readJson(fd) )
      .then(changesConf => {
        let changes = changesConf.changes;
        if (changes.length < 1) {
          console.log(msg.ERR_CHANGE_EMPTY);
          return;
        }

        if (changesConf.lock) {
          console.log(msg.ERR_LOCKED);
          return;
        }

        watchers = changes.map(change => {
          return {
              file: change,
              watcher: chokidar.watch(path.join(deployConf.source, change.path, change.filename))
                .on('change', watchedFile => onChange(change, deployConf, changesConf))
            }
          })

        console.log(msg.MSG_WATCHING_START, deployConf.source);

        // Reading user input
        process.stdin.setEncoding('utf8')
        process.stdin.on('readable', _ => {
          const chunk = process.stdin.read();

          if (chunk) {
            const args = chunk.split(/[\s\n]/).filter(e => e);

            if (args[0] === 'ls') {
              (require('./list.js'))(directory)
            }

            if (args[0] === 'tasks') {
              (require('./tasks/tasks.js'))(directory)
            }

            if (['add', '+'].includes(args[0])) {
              (require('./add-to-change'))(directory, args[1])
                .then(result => {
                  if (result) {
                    changesConf = fs.readJsonSync(changesFile);
                    changes = changesConf.changes;

                    let change = changes.find(ch => ch.filename === path.basename(args[1]) && ch.path === path.dirname(args[1]))
                    watchers.push({
                      file: change,
                      watcher: chokidar.watch(path.join(deployConf.source, args[1]))
                        .on('change', watchedFile => onChange(change, deployConf, changesConf))
                    });
                    console.log(msg.MSG_WATCHING_ADDED);
                  }
                })
            }

            if (['remove', '-'].includes(args[0])) {
              (require('./remove-from-change'))(directory, args[1])
                .then(result => {
                  if (result) {
                    let change = {
                      path: path.dirname(args[1]),
                      filename: path.basename(args[1])
                    };
                    const wrIndex = watchers.findIndex(e => e.file.filename === change.filename && e.file.path === change.path)
                    const chIndex = changes.findIndex(chf => chf.filename === change.filename && chf.paht === change.path)
                    watchers[wrIndex].watcher.close();
                    watchers.splice(wrIndex, 1);
                    changes.splice(chIndex, 1);
                    console.log(msg.MSG_WATCHING_REMOVED);
                  }
              })
            }

            if (args[0] === 'exit') {
              process.exit();
            }
          }
        });

      })
      .catch(err => {
        console.log(msg.ERR_NO_CHANGESFILE);
      })

    })
    .catch(err => {
      console.log(msg.ERR_NO_PROJECT);
    })

    function onChange(change, deployConf, changesConf) {

      fs.copy(path.join(deployConf.source, change.path, change.filename),
              path.join(directory, deployConf.editedVersion, change.path, change.filename))
        .then(_ => {
          log(change.filename + ' ' + msg.MSG_SAVED);
          change.changed = new Date().toLocaleString();
          return fs.writeJson(changesFile, changesConf, {spaces: 4})
        })
        .then(_ => log(msg.MSG_CHANGES_UPDATED))
        .catch(err => log(msg.ERR_FILE_RW))
    }

}
