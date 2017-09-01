const fs = require('fs');
const path = require('path');

module.exports = function(directory) {
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
			output.push(file.filename);
			output.push('\t' + file.path);

			if (file.changes) {
				file.changes.forEach(change => {
					output.push('\t' + change.lines);
					output.push('\t\t' + change.explanation);
				})
			}
		})

		fs.writeFile(outputFile, output.join('\r\n'), err => {
			if (!err) {
				console.log('report.txt is successfully written.');
			} else {
				console.log('File write error.')
			}
		});
	});
}
