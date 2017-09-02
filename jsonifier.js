const parseArgs					= require('minimist');
const path							= require('path');

const init							= require('./lib/init');
const newChange					= require('./lib/newChange');
const addFileToChange		= require('./lib/addFileToChange');
const removeFromChange	= require('./lib/removeFromChange');
const archiveChange			= require('./lib/archiveChange');
const watcher						= require('./lib/watcher');
const list							= require('./lib/list');
const createDirs				= require('./lib/createDirs');
const stats							= require('./lib/stats');

const argv = parseArgs(process.argv.slice(2));
const directory = path.resolve(argv.d || process.cwd());

// console.log(argv);

switch (argv._[0]) {
	case 'list':
	case 'ls':
		list(directory, argv.l, argv.f, argv.r);
		break;

	// case 'j':
	// case 'jsonify':
	// 	jsonify(directory);
	// 	break;

	case 'reportify':
	case 'r':
		reportify(directory);
		break;

	// Import from changes.json
	// case 'd':
	// case 'directoryify':
	// 	directorify(directory);
	// 	break;
	// Initialize a new project

	case 'init':
		init(directory);
		break;

  // Create statistics based on project folder
	case 'stats':
	case 's':
		stats(directory, argv.r);
		break;

	// Create a new change
	case 'new':
	case 'n':
		newChange(directory, argv._[1])
			.then(_ => {
				if (!argv.e) {
					createDirs(path.join(directory, argv._[1]));
				}
			})
			.catch(err => {});
		break;

	// Create change directories
	case 'createdirs':
	case 'crd':
		createDirs(directory).then();
		break;

	// Add a new file to a change
	case 'add':
	case '+':
		addFileToChange(directory, argv._[1]);
		break;

	// Remove file from change
	case 'remove':
	case '-':
		removeFromChange(directory, argv._[1]);
		break;

	// Archive change
	case 'archive':
	case 'ar':
	case 'zip':
		archiveChange(directory);
		break;

	case 'watch':
	case 'w':
		watcher(directory);
		break;

	case 'versionup':
		(require('./lib/versionup'))(directory);
		break;

	default:
	 	console.log('Jsonifier');
		break;
}
