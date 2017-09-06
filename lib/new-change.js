const fs        = require('fs-extra');
const path      = require('path');
const createDirs = require('./create-dirs');

const msg	= require('../lang/lang.js').getMessages();

module.exports = function(directory, changeName, title) {
	const deployConfFile = path.join(directory, '.deployconf');

  if (!changeName) {
    console.log(msg.ERR_NO_CHANGE_NAME);
    return;
  }

  if (!fs.existsSync(deployConfFile)) {
		console.log(msg.ERR_NO_PROJECT);
		return;
	}

  if ( ! /^[^<>:"\\\/\|\?\*]+$/.test(changeName) ) {
    console.log(msg.ERR_INVALID_NAME);
    return;
  }

  var changePath = path.join(directory, changeName);

  if (fs.existsSync(changePath)) {
    console.log(msg.ERR_CHANGE_ALREADY_EXISTS);
    return;
  }

  fs.mkdirs(changePath)
    .then(fs.writeJson(path.join(changePath, 'changes.json'), { name: changeName, title: title, changes: [] }, {spaces: 4} ))
    .then(_ => console.log(msg.MSG_CHANGE_CREATED))
		.then(createDirs(path.join(directory, changeName)))
    .catch(err => console.log(msg.ERR_FILE_RW));

}
