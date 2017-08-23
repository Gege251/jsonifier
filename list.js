const fs = require('fs');
const path = require('path');

module.exports = function(directory, verbose) {
	const changeFile = path.join(directory, 'changes.json');
	const outputFile = path.join(directory, 'report.txt');

	fs.readFile(changeFile, 'utf8', (err, data) => {
		if (err) {
			console.log('File reading failed.');
			return;
		}

		var files = JSON.parse(data);
		var output = "";

		files.forEach(file => {
			if (verbose) {
				output += file.filename + '\r\n';
				output += '\t' + file.path + '\r\n';

				if (file.changes) {
					file.changes.forEach(change => {
						output += '\t' + change.lines + '\r\n';
						output += '\t\t' + change.explanation + '\r\n';

						output += '\r\n';
					})
				}
			} else {
				output += path.join(file.path, file.filename) + '\n';
			}
		})

		console.log(output);
	});
}
