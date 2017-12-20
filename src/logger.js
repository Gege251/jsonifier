const fs = require('fs');
const chalk = require('chalk');

function Logger() {
}

Logger.prototype.log = function (message) {
  var log = `[${new Date().toLocaleString()}] ${chalk.yellow(message)}`;
	console.log(log);

  if (this.logFile) {
	  fs.appendFile(this.logFile, log + '\r\n', err => {
	  	if (err) {
	  		console.log('Log file writing error');
	  	}
	  });
	}
}

Logger.prototype.setLogFile = function (logFile) {
		this.logFile = logFile;
}

module.exports = Logger;
