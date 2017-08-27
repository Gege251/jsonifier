const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = function(directory, verbose) {
	const changeFile = path.join(directory, 'changes.json');
	const outputFile = path.join(directory, 'report.txt');

	fs.readFile(changeFile, 'utf8', (err, data) => {
		if (err) {
			console.log('File reading failed.');
			return;
		}

		var files = JSON.parse(data);
		var output = [];

		files.forEach(file => {
			if (verbose) {
				output.push(chalk.green(file.filename));
				output.push('\t' + file.path);
				output.push('\t' + file.added);
				output.push('\t' + file.changed);

				// if (file.changes) {
				// 	file.changes.forEach(change => {
				// 		output.push('\t' + change.lines);
				// 		output.push('\t\t' + change.explanation);
				// 	})
				// }
			} else {
				output.push(chalk.green(path.join(file.path, file.filename)));
			}
		})

		console.log(output.join('\r\n'));
	});
}
