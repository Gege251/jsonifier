const parseArgs					= require('minimist');
const path							= require('path');

const jsonify						= require('./jsonify');
const reportify					= require('./reportify');
const directorify 			= require('./directorify');
const init							= require('./init');
const newChange					= require('./newChange');
const addFileToChange		= require('./addFileToChange');
const removeFromChange	= require('./removeFromChange');
const archiveChange			= require('./archiveChange');
const watcher						= require('./watcher');
const list							= require('./list');

const argv = parseArgs(process.argv.slice(2));
const directory = path.resolve(argv.d ? argv.d : process.cwd());

// console.log(argv);

switch (argv._[0]) {
	case 'list':
	case 'l':
		list(directory, argv.v);
		break;
	// case 'j':
	// case 'jsonify':
	// 	jsonify(directory);
	// 	break;
	case 'reportify':
	case 'r':
		reportify(directory);
		break;
	// case 'd':
	// case 'directoryify':
	// 	directorify(directory);
	// 	break;
	// Initialize a new project
	case 'init':
		init(directory);
		break;
	// Create a new change
	case 'new':
	case 'n':
		newChange(directory, argv.n);
		break;
	// Add a new file to a change
	case 'add':
	case '+':
		addFileToChange(directory, argv.n);
		break;

	// Remove file from change
	case 'remove':
	case '-':
		removeFromChange(directory, argv.n)
		break;

	// Resolve according to change.json

	// Archive change
	case 'archive':
	case 'a':
		archiveChange(directory);
		break;
	case 'watch':
	case 'w':
		watcher(directory);
		break;
}
