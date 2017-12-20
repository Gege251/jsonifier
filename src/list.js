const fs    = require('fs-extra')
const path  = require('path')
const chalk = require('chalk')
const chman = require('../lib/change-manager.js')

const msg	  = require('../lang/lang.js').getMessages();

const comparePath = function(f1, f2, fullPath) {
	if (fullPath) {
		return path.join(f1.path, f1.filename).localeCompare(path.join(f2.path, f2.filename))
	} else {
		return f1.filename.localeCompare(f2.filename)
	}
}

module.exports = function(directory, verbose, fullPath, report) {

  chman.read(directory)
    .then(changesConf => {
			var files = changesConf.changes;
			let output = [];

			if (report) {
				chalk.enabled = false;
			}

			files
				.sort((f1, f2) => comparePath(f1, f2, fullPath))
			  .forEach(file => {
					let filePath = fullPath ? path.join(file.path, file.filename) : file.filename;
					if (verbose) {
						output.push(chalk.green(filePath));
						if (!fullPath) {
							output.push('\t' + file.path);
						}
						output.push('\t' + file.added);
						output.push('\t' + file.changed);

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
	.catch(err => console.log(msg.ERR_NO_CHANGESFILE));
}
