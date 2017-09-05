const fs = require('fs-extra');
const path = require('path');

function ConfigReader (names, configFiles) {
  this.configNames = [];
  this.configFilePromises = [];
}

ConfigReader.prototype.load = function(file, name) {
  this.configNames.push(name || file);
  this.configFilePromises.push(fs.readFile(path.join(__dirname, file), 'utf8'));
}

ConfigReader.prototype.read = function(name) {
  this.configFilePromises[this.configNames.indexOf(name)]
    .then(data => console.log('read: ' + data))
}

module.exports = new ConfigReader();
