const fs = require('fs-extra');
const inputFile = './changes.json';
const outputFile = './report.txt';
const destinationPath = 'C:\\Users\\g-sza\\Documents\\documents\\works';
const backupPath = destinationPath + '\\01_backup';
const sourcePath = 'C:\\JA\\tcjaPT00\\webapps';
const path = require('path');

fs.readFile(inputFile, 'utf8', (err, data) => {
	if (err) {
		console.log('File reading failed.');
		return;
	}
	
	var files = JSON.parse(data);
	
	files
		.map(file => { return file.path.split('\\') })
		.forEach(brokenPath => {
			for (var i = 2; i <= brokenPath.length; i++) {
				var path = '\\' + brokenPath.slice(1, i).join('\\');

				if (!fs.existsSync(destinationPath + path)) {
					fs.mkdirSync(destinationPath + path);
				}
			}
			
	})
	console.log('Directory tree created.');
	files.forEach(file => {
		fs.copySync(path.resolve(sourcePath + file.path, file.filename), path.resolve(destinationPath + file.path, file.filename));
	})
	console.log('Files copied.')
});