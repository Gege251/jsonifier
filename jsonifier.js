const program			= require('command');
const jsonify			= require('./jsonify');
const reportify		= require('./reportify');
const directorify = require('./directorify');
const init				= require('./init');

var directory = process.argv[3] ? process.argv[3] : process.argv[1];

switch (process.argv[2]) {
	case '-j':
		jsonify(directory);
		break;
	case '-r':
		reportify(directory);
		break;
	case '-d':
		directorify(directory);
		break;
	case 'init':
		init(directory);
		break;
}
