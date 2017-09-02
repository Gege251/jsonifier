const fs        = require('fs-extra');
const path      = require('path');

module.exports = function(directory, changeName) {
	const deployConfFile = path.join(directory, '.deployconf');

  if (!changeName) {
    console.log('Please enter a name for the change');
    return Promise.reject(new Error('Change name is not defined'));
  }

  if (!fs.existsSync(deployConfFile)) {
		console.log('Project folder is not initialized.');
		return Promise.reject(new Error('Project folder is not initialized'));
	}

  if ( ! /^[^<>:"\\\/\|\?\*]+$/.test(changeName) ) {
    console.log('Invalid name');
    return Promise.reject(new Error('Invalid name'));
  }

  var changePath = path.join(directory, changeName);

  if (fs.existsSync(changePath)) {
    console.log('Change folder already exists');
    return Promise.reject(new Error('Change folder already exists'));
  }

  return fs.mkdirs(changePath)
    .then(fs.writeJson(path.join(changePath, 'changes.json'), { name: changeName, changes: [] }, {spaces: 4} ))
    .then(_ => console.log('Change folder successfully created.'))
    .catch(err => console.log('File writing error.'));

}
