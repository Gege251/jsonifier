const fs = require('fs-extra');
const path = require('path');

const msg	= require('../../lang/lang.js').getMessages();

module.exports = function(directory, task) {
	const changesFile = path.join(directory, 'changes.json');

	if (!task) {
		console.log(msg.ERR_NO_TASK);
		return;
	}

	fs.open(changesFile, 'r+')
		.then(file => fs.readJson(file))
		.then(changesConf => {
			let tasks = changesConf.tasks || (changesConf.tasks = []);

			tasks.push({title: task, created: new Date()});

			fs.writeJson(changesFile, changesConf, {spaces: 4});
			tasks.forEach((task, i) => {
				console.log(` ${i}: ${task.title}`);
			})
		})
		.catch(err => console.log(msg.ERR_FILE_RW));
}
