const fs = require('fs-extra');
const path = require('path');

const msg	= require('../../lang/lang.js').getMessages();

module.exports = function(directory, task) {
	const changesFile = path.join(directory, 'changes.json');

	fs.open(changesFile, 'r').then(file => {
		fs.readJson(file).then(changesConf => {
			let tasks = changesConf.tasks;

			console.log(`\n - ${msg.MSG_TASKS_WELCOME} - \n`)
			if (!tasks || tasks.length == 0) {
				console.log('none');
			} else {
				tasks.forEach((task, i) => {
					console.log(` ${i}: ${task.title}`);
				})
			}
		})
		.catch(err => console.log(msg.ERR_FILE_RW));
	})
	.catch(err => console.log(msg.ERR_NO_CHANGESFILE));

}