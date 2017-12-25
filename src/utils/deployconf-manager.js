const fs   = require('fs-extra')
const path = require('path')

module.exports = {
  exists,
  read,
  readSync,
  findDeployconfFile,
  findProjectDir,
  dpFileName
}

// Checks if deployconf file exists in the directory or in any of its parents
function exists(dpDir) {
  return findDeployconfFile(dpDir) !== '' 
}

// Read the contents of the deployconf file
function read(dpDir) {
  const deployconfFile = findDeployconfFile(dpDir)
  if (deployconfFile) {
    return fs.open(deployconfFile, 'r') .then(chFile => fs.readJson(chFile))
  } else {
    return null
  }
}

// Read the contents of the deployconf file
function readSync(dpDir) {
	return fs.readJsonSync(findDeployconfFile(dpDir))
}

// Find the deployconf file in current directory, or any of its parents
// If nothing found and empty string is returned
function findDeployconfFile(directory) {
  const projectDir = findProjectDir(directory)
  return projectDir ? getDeployconfFile(projectDir) : ''
}

// Search for a valid project directory (which has a deployconf file)
// recursively until it reaches the root
function findProjectDir(directory) {
  if (directory === '/' || directory === '') {
    return ''
  } else if (fs.existsSync(path.join(directory, dpFileName()))) {
    return directory
  } else {
    return findProjectDir(path.dirname(directory))
  }
}

// Returns the filename of the deployconf file
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
