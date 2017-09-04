const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory, task) {
	const changesFile = path.join(directory, 'changes.json');

	if (!task) {
		console.log('Please enter a task in your second argument');
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
		.catch(err => console.log('File handling error'));
}