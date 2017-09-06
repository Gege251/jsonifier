const fs = require('fs-extra');
const path = require('path');

const msg	= require('../../lang/lang.js').getMessages();

module.exports = function(directory, taskIndex) {
	const changesFile = path.join(directory, 'changes.json');

	if (!Number.isInteger(taskIndex)) {
		console.log(msg.ERR_NO_TASKINDEX);
		return;
	}

	fs.open(changesFile, 'r+')
		.then(file =>　{ fs.readJson(file)　
			.then(changesConf => {
				let tasks = changesConf.tasks;

				if (!tasks || !tasks[taskIndex]) {
					console.log(msg.ERR_NO_TASK);
					return;
				}

				tasks.splice(taskIndex, 1);
				fs.writeJson(changesFile, changesConf, {spaces: 4})

				tasks.forEach((task, i) => {
					console.log(` ${i}: ${task.title}`);
				})
			})
			.catch(err => console.log(msg.ERR_FILE_RW))
		})
		.catch(err => console.log(msg.ERR_NO_CHANGESFILE))

}
