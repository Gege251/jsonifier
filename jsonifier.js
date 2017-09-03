const parseArgs	= require('minimist');
const path			= require('path');

const argv			= parseArgs(process.argv.slice(2));
const directory	= path.resolve(argv.d || process.cwd());

const modules		= [
	{
		keys: [ 'init' ],
		path: './lib/init',
		args: [ directory ] },
	{
		keys: [ 'new', 'n' ],
		path: './lib/newChange',
		args: [ directory, argv._[1] ] },
	{
		keys: [ 'add', '+'],
		path: './lib/addFileToChange',
		args: [ directory, argv._[1] ] },
	{
		keys: [ 'remove', '-'],
		path: './lib/removeFromChange',
		args: [ directory, argv._[1] ] },
	{
		keys: [ 'archive', 'zip'],
		path: './lib/archiveChange',
		args: [ directory ] },
	{
		keys: [ 'watcher', 'w' ],
		path: './lib/watcher',
		args: [ directory ] },
	{
		keys: [ 'ls' ],
		path: './lib/list',
		args: [ directory, argv.l, argv.f, argv.r ] },
	{
		keys: [ 'createdirs', 'crd' ],
		path: './lib/createDirs',
		args: [ directory ] },
	{
		keys: [ 'stats', 's' ],
		path: './lib/stats',
		args: [ directory, argv.r ]	}
]

function loadModule(moduleName) {
	const module = modules.find(module => module.keys.includes(moduleName));
	(require(module.path))(...module.args);
}

loadModule(argv._[0]);
