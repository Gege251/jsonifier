const fs   = require('fs-extra')
const path = require('path')

module.exports = {
  ensure,
  exists,
  read,
  findDeployconfFile,
  findProjectDir,
  dpFileName
}

// If no deployconf file is found create a new one in the current directory
function ensure(dpDir) {
  if (! exists(dpDir)) {
    create(dpDir)
  } 
}

// Checks if deployconf file exists in the directory or in any of its parents
function exists(dpDir) {
  return findDeployconfFile(dpDir) !== '' 
}

// Read the contents of the deployconf file
function read(dpDir) {
	return fs.open(findDeployconfFile(dpDir), 'r')
    .then(chFile => fs.readJson(chFile))
}

// Find the deployconf file in current directory, or any of its parents
// If nothing found and empty string is returned
function findDeployconfFile(directory) {
  const projectDir = findProjectDir(directory)
  return projectDir ? getDeployconfFile(projectDir) : ''
}

function findProjectDir(directory) {
  if (directory === '/' || directory === '') {
    return ''
  } else if (fs.existsSync(path.join(directory, dpFileName()))) {
    return directory
  } else {
    return findProjectDir(path.dirname(directory))
  }
}

function dpFileName() {
  return fs.readJsonSync(path.join(__dirname, '../../config.json')).deployconfFile.filename
}

//
// Not exported functions
//

// Create the full path of the changes file
function getDeployconfFile(dpDir) {
	return path.join(dpDir, '.deployconf')
}
