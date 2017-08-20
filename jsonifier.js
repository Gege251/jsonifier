const jsonify			= require('./jsonify');
const reportify		= require('./reportify');
const directorify = require('./directorify');
const init				= require('./init');

var directory = process.argv[3] ? process.argv[3] : process.argv[1];

switch (process.argv[2]) {
	case 'j':
	case 'jsonify':
		jsonify(directory);
		break;
	case '-r':
		reportify(directory);
		break;
	case '-d':
		directorify(directory);
		break;
	// Initialize a new project
	case 'init': 
		init(directory);
		break;
	// Create a new change
	case 'new':
		break;
	// Add a new file to a change
	case 'add':
		break;
}
