const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const msg	= require('../lang/lang.js').getMessages();

module.exports = function(directory, verbose, fullPath, report) {
	const changesFile = path.join(directory, 'changes.json');

	fs.open(changesFile, 'r').then(file => {
		fs.readJson(file).then(changesConf => {
			var files = changesConf.changes;
			let output = [];

			if (report) {
				chalk.enabled = false;
			}

			files
				.sort((f1, f2) => f1.filename.localeCompare(f2.filename))
			  .forEach(file => {
					let filePath = fullPath ? path.join(file.path, file.filename) : file.filename;
					if (verbose) {
						output.push(chalk.green(filePath));
						if (!fullPath) {
							output.push('\t' + file.path);
						}
						output.push('\t' + file.added);
						output.push('\t' + file.changed);

						// if (file.changes) {
						// 	file.changes.forEach(change => {
						// 		output.push('\t' + change.lines);
						// 		output.push('\t\t' + change.explanation);
						// 	})
						// }
					} else {
						output.push(chalk.green(filePath));
					}
				})

			if (report) {
				fs.writeFile(path.join(directory, 'report.txt'), output.join('\r\n'))
					.then(console.log(msg.MSG_REPORT_CREATED))
					.catch(err => console.log(msg.ERR_FILE_RW))

			} else {
					console.log(output.join('\r\n'));
			}
		})
		.catch(err => console.log(err));
	})
	.catch(err => console.log(msg.ERR_NO_CHANGESFILE));
}
