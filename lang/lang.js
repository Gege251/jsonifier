const fs = require('fs-extra');
const path = require('path');

function Lang() {
	this.lang = 'en';
	this.messages;
}

Lang.prototype.setLang = function (arg) {
		this.lang = arg && fs.existsSync(path.join(__dirname, '../lang', arg, 'messages.json'))
				? arg : 'en';
		this.messages = fs.readJsonSync(path.join(__dirname, '../lang', this.lang, 'messages.json'));
}

Lang.prototype.getMessages = function() {
	return this.messages;
};

Lang.prototype.getLang = function() {
	return this.lang;
}

module.exports = new Lang();