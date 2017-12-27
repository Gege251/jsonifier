const fs   = require('fs-extra')
const path = require('path')

module.exports = {
  exists,
  read,
  readSync,
  findDeployconfFile,
  findProjectDir,
  findArchiveDir,
  dpFileName
}

// Checks if deployconf file exists in the directory or in any of its parents
function exists(dpDir) {
  return findDeployconfFile(dpDir) !== '' 
}

// Read the contents of the deployconf file
function read(dpDir) {
  try {

    const deployconfFile = findDeployconfFile(dpDir)
    return fs.open(deployconfFile, 'r') .then(chFile => fs.readJson(chFile))

  } catch(e) {
    return Promise.reject(e)
  }
}

// Read the contents of the deployconf file
function readSync(dpDir) {
  try {

    const deployconfFile = findDeployconfFile(dpDir)
    return fs.readJsonSync(findDeployconfFile(dpDir))

  } catch(e) {
    throw e
  }
}

// Find the deployconf file in current directory, or any of its parents
// If nothing found and empty string is returned
function findDeployconfFile(directory) {
  try {

    const projectDir = findProjectDir(directory)
    return projectDir ? getDeployconfFile(projectDir) : ''

  } catch(e) {
    throw e
  }
}

// Search for a valid project directory (which has a deployconf file)
// recursively until it reaches the root
function findProjectDir(directory) {
  if (directory === '/' || directory === '') {
    throw new Error('No deployconf file!')

  } else if (fs.existsSync(path.join(directory, dpFileName()))) {
    return directory

  } else {
    return findProjectDir(path.dirname(directory))
  }
}

// Find the archive directory
function findArchiveDir(directory) {
  try {

    const projectDir = findProjectDir(directory)
    return path.join(projectDir, readSync(directory).archive)

  } catch(e) {
    throw e
  }
}

// Returns the filename of the deployconf file
function dpFileName() {
  return fs.readJsonSync(path.join(__dirname, '../../config.json')).deployconfFile.filename || '.deployconf'
}

//
// Not exported functions
//

// Create the full path of the changes file
function getDeployconfFile(dpDir) {
	return path.join(dpDir, '.deployconf')
}
