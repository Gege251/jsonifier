const parseArgs	= require('minimist');
const fs			= require('fs-extra');
const path			= require('path');

const argv			= parseArgs(process.argv.slice(2));
const directory	= path.resolve(argv.d || process.cwd());
const lang			= process.env.LANGUAGE == 'ja_JP' ? 'ja' : 'en';

const config		= require('./lib/config-reader');

config.load('../lang/en/messages', 'messages');
config.read('messages');

const modules		= [
	{
		keys: [ 'init' ],
		path: './lib/init',
		args: [ directory ],
		description: {
			en: 'Initialize project folder.',
			ja: '新規プロジェクトフォルダーを作成。' }
	},
	{
		keys: [ 'new', 'n' ],
		path: './lib/new-change',
		args: [ directory, argv._[1] ],
		description: {
			en: 'Create a new change folder.',
			ja: '新規課題フォルダーを作成。' }
	},
	{
		keys: [ 'add', '+'],
		path: './lib/add-to-change',
		args: [ directory, argv._[1] ],
		description: {
			en: 'Add a new file to change.',
			ja: 'ファイルを課題に追加。' }
	},
	{
		keys: [ 'remove', '-'],
		path: './lib/remove-from-change',
		args: [ directory, argv._[1] ],
		description: {
			en: 'Remove a file from change',
			ja: 'ファイルを課題から排除。' }
	},
	{
		keys: [ 'archive', 'ar'],
		path: './lib/archive-change',
		args: [ directory ],
		description: {
			en: 'Archive a change to zip file.',
			ja: '課題の圧縮したアーカイブを作成。' }
	},
	{
		keys: [ 'watcher', 'w' ],
		path: './lib/watcher',
		args: [ directory ],
		description: {
			en: 'Watch source code for changes.',
			ja: 'ソースコードを監視。' }
	},
	{
		keys: [ 'ls' ],
		path: './lib/list',
		args: [ directory, argv.l, argv.f, argv.r ],
		description: {
			en: 'List files in the change. Options: -l detailed, -f full path, -r report to file',
			ja: '課題のファイルの一覧表示。オプション: -l 詳細表示 -f フルパス -r レポートファイル作成' }
	},
	{
		keys: [ 'create-dirs', 'crd' ],
		path: './lib/createDirs',
		args: [ directory ],
		description: {
			en: 'Create subdirectories in change folder.',
			ja: '課題フォルダーのサブフォルダーを作成。' }
	},
	{
		keys: [ 'stats', 's' ],
		path: './lib/stats',
		args: [ directory, argv.r ],
		description: {
			en: 'Write out statistics about current project.',
			ja: 'プロジェクト統計を表示。' }
	},
	{
		keys: [ 'tasks', 't' ],
		path: './lib/tasks/tasks',
		args: [ directory ],
		description: {
			en: 'Lists all tasks. Options: -a all',
			ja: 'タスク一覧表示。オプション: -a 全部' }
	},
	{
		keys: [ 'add-task', '+t' ],
		path: './lib/tasks/addTask',
		args: [ directory, argv._[1] ],
		description: {
			en: 'Adds a new task to change.',
			ja: '新規タスク作成。' }
	},
	{
		keys: [ 'remove-task', '-t' ],
		path: './lib/tasks/removeTask',
		args: [ directory, argv._[1] ],
		description: {
			en: 'Removes a task from change.',
			ja: 'タスク排除。' }
	},
]

function loadModule(moduleName) {
	const module = modules.find(module => module.keys.includes(moduleName));
	if (module) {
		(require(module.path))(...module.args);
	} else if (moduleName == 'help') {
		// Listing all command options
		console.log('scw commands:\n');

		modules.forEach(module => module.keys = module.keys.join(', '));
		var longestOption = modules
			.map(module => module.keys.length)
			.reduce((m1, m2) => Math.max(m1, m2));

		modules.forEach(module => {
			let spaces = ' '.repeat(longestOption - module.keys.length + 2);
			console.log('\t' + module.keys + spaces + module.description[lang]);
		})
	} else {
		const version = fs.readJsonSync(path.join(__dirname, 'package.json')).version;
		console.log('scw v' + version);
		console.log(`For the list of commands write 'scw help'`);
	}
}

loadModule(argv._[0]);
