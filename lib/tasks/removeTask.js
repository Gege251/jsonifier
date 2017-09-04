const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory, taskIndex) {
	const changesFile = path.join(directory, 'changes.json');

	if (!Number.isInteger(taskIndex)) {
		console.log('Please enter the index of a task as your second argument');
		return;
	}

	fs.open(changesFile, 'r+')
		.then(file => fs.readJson(file))
		.then(changesConf => {
			let tasks = changesConf.tasks;

			if (!tasks || !tasks[taskIndex]) {
				console.log(`Task doesn't exist`);
				return;
			}

			tasks.splice(taskIndex);
			fs.writeJson(changesFile, changesConf, {spaces: 4})

			tasks.forEach((task, i) => {
				console.log(` ${i}: ${task.title}`);
			})
		})
		.catch(err => console.log('File handling error'))

}