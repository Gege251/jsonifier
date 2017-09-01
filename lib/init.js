const fs        = require('fs-extra');
const path      = require('path');
const chalk     = require('chalk');
const inquirer  = require('inquirer');

module.exports = function(directory) {
  console.log('Initializing a new versioning in the following directory:');
  console.log(directory + '\n');
  console.log('Press CTRL+C to exit any time.\n')

  var inquirer = require('inquirer');
  var nameRegExp = /^[^<>:"\\\/\|\?\*]+$/;
  var pathRegExp = /^(["'])?(?:\w:)?(?:(\/|\\)[^<>:"\\\/\|\?\*]+)*\1$/;
  var subFolderRegExp = /^(["'])?(?:(\/|\\)?[^<>:"\\\/\|\?\*]+)*\1$/;
  var questions = [
    {
      name: 'name',
      type: 'input',
      message: 'Project folder name:',
      validate: function( value ) {
        if (!nameRegExp.test(value)) {
          return 'Please enter a folder name';
        }

        if (fs.existsSync(path.join(directory, value))) {
          return 'Project folder already exists'
        }

        return true;
      }
    },
    {
      name: 'source',
      type: 'input',
      message: 'Project source path:',
      validate: function( value ) {
        if (!pathRegExp.test(value)) {
          return 'Please enter a valid path';
        }

        if (!fs.existsSync(value)) {
          return 'Source folder doesn\'t exist'
        }
        return true;
      }
    },
    {
      name: 'originalVersion',
      type: 'input',
      message: 'Subfolder for original files:',
      validate: function( value ) {
        if (!value || !subFolderRegExp.test(value)) {
          return 'Please enter a valid path';
        }

        return true;
      }
    },
    {
      name: 'editedVersion',
      type: 'input',
      message: 'Subfolder for edited files:',
      validate: function( value ) {
        if (!subFolderRegExp.test(value)) {
          return 'Please enter a valid path';
        }
        return true;
      }
    },
    {
      name: 'archive',
      type: 'input',
      message: 'Subfolder for archives:',
      validate: function( value ) {
        if (subFolderRegExp.test(value)) {
          return true;
        } else {
          return 'Please enter a valid path';
        }
      }
    },
    {
      name: 'otherDirs',
      type: 'input',
      message: 'Other subfolders (separated by ;):',
      validate: function( values ) {
        if ( !values || values.split(';').map(v => v.trim()).every(v => subFolderRegExp.test(v) )) {
          return true;
        } else {
          return 'Please enter valid paths';
        }
      }
    }

  ];

  inquirer.prompt(questions).then(answers => {
    answers.otherDirs = answers.otherDirs.split(';').map(v => v.trim());
    var projectPath = path.join(directory, answers.name);

    fs.mkdirs(projectPath)
      .then(
        fs.writeFile(path.join(projectPath, '.deployconf'), JSON.stringify(answers, null, 4), err => {
          if (err) {
            console.log('File writing error.')
          } else {
            console.log('Project folder successfully created.')
          }
        }));

  });

}
