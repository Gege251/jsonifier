const fs        = require('fs-extra');
const path      = require('path');
const chalk     = require('chalk');
const inquirer  = require('inquirer');

const msg	= require('../lang/lang.js').getMessages();

module.exports = function(directory) {
  console.log(msg.MSG_INIT_WELCOME);
  console.log(directory + '\n');
  console.log(msg.MSG_EXIT_HELP + '\n');

  var inquirer = require('inquirer');
  var nameRegExp = /^[^<>:"\\\/\|\?\*]+$/;
  var pathRegExp = /^(["'])?(?:\w:)?(?:(\/|\\)[^<>:"\\\/\|\?\*]+)*\1$/;
  var subFolderRegExp = /^(["'])?(?:(\/|\\)?[^<>:"\\\/\|\?\*]+)*\1$/;
  var questions = [
    {
      name: 'name',
      type: 'input',
      message: msg.INQ_PROJECT_NAME,
      validate: function( value ) {
        if (!nameRegExp.test(value)) {
          return msg.ERR_NOT_FOLDER;
        }

        if (fs.existsSync(path.join(directory, value))) {
          return msg.ERR_PROJECT_ALREADY_EXISTS;
        }

        return true;
      }
    },
    {
      name: 'source',
      type: 'input',
      message: msg.INQ_SRC_PATH,
      validate: function( value ) {
        if (!pathRegExp.test(value)) {
          return msg.ERR_NOT_PATH;
        }

        if (!fs.existsSync(value)) {
          return msg.ERR_NO_SOURCE_FOLDER;
        }
        return true;
      }
    },
    {
      name: 'originalVersion',
      type: 'input',
      message: msg.INQ_SUBFOLDER_ORIGINAL,
      validate: function( value ) {
        if (!value || !subFolderRegExp.test(value)) {
          return msg.ERR_NOT_PATH;
        }

        return true;
      }
    },
    {
      name: 'editedVersion',
      type: 'input',
      message: msg.INQ_SUBFOLDER_EDITED,
      validate: function( value ) {
        if (!subFolderRegExp.test(value)) {
          return msg.ERR_NOT_PATH;
        }
        return true;
      }
    },
    {
      name: 'archive',
      type: 'input',
      message: msg.INQ_SUBFOLDER_ARCHIVED,
      validate: function( value ) {
        if (subFolderRegExp.test(value)) {
          return true;
        } else {
          return msg.ERR_NOT_PATH;
        }
      }
    },
    {
      name: 'otherDirs',
      type: 'input',
      message: msg.INQ_SUBFOLDER_OTHERS,
      validate: function( values ) {
        if ( !values || values.split(';').map(v => v.trim()).every(v => subFolderRegExp.test(v) )) {
          return true;
        } else {
          return msg.ERR_NOT_PATHS;
        }
      }
    }

  ];

  inquirer.prompt(questions).then(answers => {
    answers.otherDirs = answers.otherDirs.split(';').map(v => v.trim());
    var projectPath = path.join(directory, answers.name);

    fs.mkdirs(projectPath)
      .then(fs.writeJson(path.join(projectPath, '.deployconf'), answers, {spaces: 4}))
      .then(_ => console.log(msg.MSG_INIT_COMPLETE))
      .catch(err => console.log(msg.ERR_FILE_RW));
  });

}
