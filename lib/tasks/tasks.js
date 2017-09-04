const fs = require('fs-extra');
const path = require('path');

module.exports = function(directory, task) {
	const changesFile = path.join(directory, 'changes.json');

	fs.open(changesFile, 'r')
		.then(file => fs.readJson(file))
		.then(changesConf => {
			let tasks = changesConf.tasks;

			console.log('\n - Current tasks - \n')
			if (!tasks || tasks.length == 0) {
				console.log('none');
			} else {
				tasks.forEach((task, i) => {
					console.log(` ${i}: ${task.title}`);
				})
			}
			
		})
		.catch(err => console.log('File handling error.'))
	
}