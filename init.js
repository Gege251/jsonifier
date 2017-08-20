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
      message: 'Main folder name:',
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
        if (!value || !subFolderRegExp.test(value)) {
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
        if (!value || subFolderRegExp.test(value)) {
          return true;
        } else {
          return 'Please enter a valid path';
        }
      }
    }

  ];

  inquirer.prompt(questions).then(function (deployConf) {
    var projectPath = path.join(directory, deployConf.name);

    fs.mkdirsSync(projectPath);
    fs.writeFile(path.join(projectPath, '.deployconf'), JSON.stringify(deployConf, null, 4), err => {
      if (err) {
        console.log('File writing error.')
      } else {
        console.log('Project folder successfully created.')
      }
    })

  });

}
