const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory) {
  fs.readJSON(path.join(directory, 'changes.json'))
    .then(changesObj => {
      if (!Array.isArray(changesObj)) {
          console.log('This file seems to be already updated.');
          return Promise.reject();
      }

      let newChangesObject = {
        name: path.basename(directory),
        changes: changesObj
      };
      return fs.writeJSON(path.join(directory, 'changes.json'), newChangesObject, {spaces: 4});
    })
    .then(_ => console.log('Changes file updated.'))
    .catch(err => {
      if (err) {
        console.log('Something went wrong');
      }
    });
}
