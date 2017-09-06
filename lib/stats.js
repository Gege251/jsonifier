const fs    = require('fs-extra');
const path  = require('path');
const chalk = require('chalk');

var when = function (cond, thenVal, elseVal) {
  if (cond) {
    return thenVal || null;
  } else {
    return elseVal || null;
  }
}

module.exports = function (directory, report) {
  const projectDir = 
    fs.existsSync(path.join(directory, '.deployconf')) ? directory :
      fs.existsSync(path.join(directory, '../.deployconf')) ? path.join(directory, '../') : null;

	const deployConfFile = path.join(projectDir, '.deployconf');

	if (!fs.existsSync(deployConfFile)) {
		console.log('Project folder is not initialized.')
		return;
	}
	var deployConf = fs.readJsonSync(deployConfFile);

  fs.readdir(projectDir)
    .then(entries =>
      entries
        .filter(entry =>
          entry != '.deployconf'
          && entry != deployConf.archive
          && fs.lstatSync(path.join(projectDir, entry)).isDirectory()
          && fs.readdirSync(path.join(projectDir, entry)).includes('changes.json') )
        .map(entry =>
          fs.readJson(path.join(projectDir, entry, 'changes.json'))) )
    .then(promises => Promise.all(promises))
    // Get the first add date and the last edit date of changes
    .then(entries => {
      return [
        entries.map(change => change.name),

        entries.map(change =>
          !change.changes.length ? null :
            change.changes
              .map(file => new Date(file.added))
              .reduce((added1, added2) => Math.min(added1, added2))
            ),

        entries.map(change =>
          !change.changes.length ? null :
            change.changes
              .map(file => new Date(file.changed))
              .reduce((changed1, changed2) => Math.max(changed1, changed2))
            ),

        entries.map(change => change.changes.length)
      ]
      })
    // Rearranging the array structure [ [a0, b0, c0], [a1, b1, c1] ] => [ [a0, a1], [b0, b1], [c0, c1] ]
    .then(entries =>
        entries[0].map((entry, index) =>
          entries.reduce((acc, curr) =>
            acc.concat(curr[index]), [])))
    // Sort by last changed date (decreasing)
    .then(entries =>
      entries.sort((e1, e2) => e1[2] - e2[2])
    )
    // Creating output
    // .then(entries =>¡¡console.log(entries))
    .then(entries => {
      if (report) {
        chalk.enabled = false;
      }

      let output = [];
      entries.forEach(entry => {
        output.push(chalk.yellow(entry[0]));
        if (entry[1]) output.push('\tFirst added on: ' + new Date(entry[1]).toLocaleString());
        if (entry[2]) output.push('\tLast edited on: ' + new Date(entry[2]).toLocaleString());
        output.push('\tEdited files: ' + entry[3]);
      })

      if (report) {
          fs.writeFile('report.txt', output.join('\r\n'))
    				.then(console.log('report.txt is successfully written.'))
    				.catch(err => console.log('File write error.'));
      } else {
        console.log(output.join('\r\n'));
      }

    })
    .catch(err => console.log(err))

}
