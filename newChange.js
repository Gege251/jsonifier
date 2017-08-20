const fs        = require('fs-extra');
const path      = require('path');

module.exports = function(directory, changeName) {

  if ( ! /^[^<>:"\\\/\|\?\*]+$/.test(changeName) ) {
    console.log('Invalid name');
    return;
  }

  var changePath = path.join(directory, changeName);

  if (fs.existsSync(changePath)) {
    console.log('Change folder already exists');
    return;
  }

  fs.mkdirsSync(changePath);
  fs.writeFile(path.join(changePath, 'changes.json'), '{}', err => {
    if (err) {
      console.log('File writing error.')
    } else {
      console.log('Change folder successfully created.')
    }
  })

}
