const fs = require('fs');
const path = require('path');

module.exports = function(directory) {
	const inputFile = path.resolve(directory, 'changes.json');
	const outputFile = path.resolve(directory, 'report.txt');

	fs.readFile(inputFile, 'utf8', (err, data) => {
		if (err) {
			console.log('File reading failed.');
			return;
		}

		var files = JSON.parse(data);
		var output = ""

		files.forEach(file => {
			output += file.file + '\r\n';
			output += '\t' + file.path + '\r\n';

			file.changes.forEach(change => {
				output += '\t' + change.lines + '\r\n';
				output += '\t\t' + change.explanation + '\r\n';

				output += '\r\n';
			})
		})

		fs.writeFile(outputFile, output, err => {
			if (!err) {
				console.log('File successfully saved.');
			} else {
				console.log('File write error.')
			}
		});
	});
}
