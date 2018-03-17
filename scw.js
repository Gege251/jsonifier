const parseArgs	= require('minimist')
const fs				= require('fs-extra')
const path			= require('path')

const argv			= parseArgs(process.argv.slice(2))
const config    = fs.readJsonSync(path.join(__dirname, 'config.json'))

const lang			= require('./src/lang/lang.js')
lang.setLang(argv.lang || fs.readJsonSync(path.join(__dirname, './config.json')).lang)

const msg 			= lang.messages
const directory	= path.resolve(argv.d || process.cwd())

const modules = [
	{
		keys: [ 'init' ],
		path: './src/init',
		args: [ directory ],
		description: {
			en: 'Initialize project folder.',
			ja: '新規プロジェクトフォルダーを作成。' }
	},
	{
		keys: [ 'new-change', 'nc' ],
		path: './src/new-change',
		args: [ directory, argv._[1], argv.t || argv.title ],
		description: {
			en: 'Create a new change folder.',
			ja: '新規課題フォルダーを作成。' }
	},
	{
		keys: [ 'add', '+' ],
		path: './src/add-to-change',
		args: [ directory, argv._[1] ],
		description: {
			en: 'Add a new file to change.',
			ja: 'ファイルを課題に追加。' }
	},
	{
		keys: [ 'new', '.+' ],
		path: './src/newfile-to-change',
		args: [ directory, argv._[1] ],
		description: {
			en: 'Create a new file to change.',
			ja: '新規ファイルを課題に追加。' }
	},
	{
		keys: [ 'remove', '-' ],
		path: './src/remove-from-change',
		args: [ directory, argv._[1] ],
		description: {
			en: 'Remove a file from change',
			ja: 'ファイルを課題から排除。' }
	},
	{
		keys: [ 'archive', 'ar' ],
		path: './src/archive-change',
		args: [ directory ],
		description: {
			en: 'Archive a change to zip file.',
			ja: '課題の圧縮したアーカイブを作成。' }
	},
	{
		keys: [ 'watcher', 'w' ],
		path: './src/watcher',
		args: [ directory ],
		description: {
			en: 'Watch source code for changes.',
			ja: 'ソースコードを監視。' }
	},
	{
		keys: [ 'ls' ],
		path: './src/list',
		args: [ directory, argv.l, argv.f, argv.r ],
		description: {
			en: 'List files in the change. Options: -l detailed, -f full path, -r report to file',
			ja: '課題のファイルの一覧表示。オプション: -l 詳細表示 -f フルパス -r レポートファイル作成' }
	},
	{
		keys: [ 'create-dirs', 'crd' ],
		path: './src/create-dirs',
		args: [ directory ],
		description: {
			en: 'Create subdirectories in change folder.',
			ja: '課題フォルダーのサブフォルダーを作成。' }
	},
	{
		keys: [ 'stats', 's' ],
		path: './src/stats',
		args: [ directory, argv.r ],
		description: {
			en: 'Write out statistics about current project.',
			ja: 'プロジェクト統計を表示。' }
	},
	{
		keys: [ 'patch', 'p' ],
		path: './src/patch',
		args: [ directory ],
		description: {
			en: 'Applies changes to source',
			ja: '変更をソースに反映' }
	},
	{
		keys: [ 'unpatch', 'unp' ],
		path: './src/unpatch',
		args: [ directory ],
		description: {
			en: 'Rollback to original',
			ja: '修正前の状態にロールバック' }
	}
]

function loadModule(moduleName) {
	const module = modules.find(module => module.keys.includes(moduleName))
	if (module) {
		(require(module.path))(...module.args)
	}

	else if (!moduleName && !argv.v) {
		const npmConf = fs.readJsonSync(path.join(__dirname, 'package.json'))

		console.log(`${npmConf.name} v${npmConf.version}`)
		console.log(msg.MSG_WELCOME)
		return
	}

	else if (moduleName === 'help') {
		// Listing all command options
		console.log(msg.MSG_HELP +'\n')

		modules.forEach(module => module.keys = module.keys.join(', '))
		var longest = modules
			.map(module => module.keys.length)
			.reduce((m1, m2) => Math.max(m1, m2))

		modules.forEach(module => {
			let spaces = ' '.repeat(longest - module.keys.length + 2)
			console.log('\t' + module.keys + spaces + module.description[lang.getLang()])
		})
		return
	}

	else if (moduleName === 'version' || argv.v) {
		const npmConf = fs.readJsonSync(path.join(__dirname, 'package.json'))
		console.log(`${npmConf.version}`)
	}

	else {
		const npmConf = fs.readJsonSync(path.join(__dirname, 'package.json'))

		console.log(`${npmConf.name} v${npmConf.version}`)
		console.log(msg.ERR_NO_SUCH_COMMAND)
		return
	}
}

loadModule(argv._[0])
