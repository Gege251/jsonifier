const fs		= require('fs');
const path	= require('path');

module.exports = function(directory) {
	const inputFile = path.resolve(directory, 'changes.txt');
	const outputFile = path.resolve(directory, 'changes.json');

	fs.readFile(inputFile, 'utf8', (err, data) => {
		if (err) {
			console.log('File reading failed.')
			return;
		}

		lines = data.split('\n');

		var files = [];

		for (var i = 0; i < lines.length; i++) {
			if (/^\w/.test(lines[i])) {
				files.push({filename: lines[i].trim()});
			}

			else if (/^\t(\/|\\)/.test(lines[i])) {
				var lastFile = files[files.length-1];
				lastFile.path = lines[i].trim();
			}

			else if (/^\t\d+-?/.test(lines[i])) {
				var lastFile = files[files.length-1];
				if (!lastFile.changes) {
					lastFile.changes = [];
				}

				lastFile.changes.push({lines: lines[i].trim()});
			}

			else if (/^\t\t/.test(lines[i])) {
				var lastFile = files[files.length-1];
				var lastChange = lastFile.changes[lastFile.changes.length-1];

				lastChange.explanation = lines[i].trim();
			}
		}

		fs.writeFile(outputFile, JSON.stringify(files, null, 4), err => {
			if (!err) {
				console.log('File successfully saved.');
			} else {
				console.log('File write error.')
			}
		});
	});
}
