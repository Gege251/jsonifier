const parseArgs	= require('minimist');
const path			= require('path');

const argv			= parseArgs(process.argv.slice(2));
const directory	= path.resolve(argv.d || process.cwd());

const modules		= [
	{
		keys: [ 'init' ],
		path: './lib/init',
		args: [ directory ],
		description: 'Initialize project folder.'
	},
	{
		keys: [ 'new', 'n' ],
		path: './lib/newChange',
		args: [ directory, argv._[1] ],
		description: 'Create a new change folder.'
	},
	{
		keys: [ 'add', '+'],
		path: './lib/addFileToChange',
		args: [ directory, argv._[1] ],
		description: 'Add a new file to change.'
	},
	{
		keys: [ 'remove', '-'],
		path: './lib/removeFromChange',
		args: [ directory, argv._[1] ],
		description: 'Remove a file from change'
	},
	{
		keys: [ 'archive', 'zip'],
		path: './lib/archiveChange',
		args: [ directory ],
		description: 'Archive a change to zip file.'
	},
	{
		keys: [ 'watcher', 'w' ],
		path: './lib/watcher',
		args: [ directory ],
		description: 'Start watching files for changes.'
	},
	{
		keys: [ 'ls' ],
		path: './lib/list',
		args: [ directory, argv.l, argv.f, argv.r ],
		description: 'List files in the change. Options: -l -f -r'
	},
	{
		keys: [ 'createdirs', 'crd' ],
		path: './lib/createDirs',
		args: [ directory ],
		description: 'Create directories for change folder.'
	},
	{
		keys: [ 'stats', 's' ],
		path: './lib/stats',
		args: [ directory, argv.r ],
		description: 'Write out statistics about current project.'
	}
]

function loadModule(moduleName) {
	const module = modules.find(module => module.keys.includes(moduleName));
	if (module) {
		(require(module.path))(...module.args);
	} else {
		// Listing all command options
		console.log('Jsonifier commands:\n');

		modules.forEach(module => module.keys = module.keys.join(', '));
		var longestOption = modules
			.map(module => module.keys.length)
			.reduce((m1, m2) => Math.max(m1, m2));

		modules.forEach(module => {
			let spaces = ' '.repeat(longestOption - module.keys.length + 2);
			console.log('\t' + module.keys + spaces + module.description);
		})
	}
}

loadModule(argv._[0]);
