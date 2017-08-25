const fs = require('fs');

function Logger(logFile) {
	this.logFile = logFile;
}

Logger.prototype.log = function (message) {
  var log = '[' + new Date().toLocaleString() +'] ' + message;
  console.log(log);
  if (this.logFile) {
	  fs.appendFile(this.logFile, log + '\r\n', err => {
	  	if (err) {
	  		console.log('Log file writing error');
	  	}
	  });
	}
}

module.exports = Logger;