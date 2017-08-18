const jsonify = require('./jsonify.js');
const reportify = require('./reportify.js');
const directorify = require('./directorify.js');

var directory = process.argv[3];

if (process.argv[2] === '-j') {
	jsonify(directory);
}

if (process.argv[2] === '-r') {
	reportify(directory);
}

if (process.argv[2] === '-d') {
	directorify(directory);
}