const fs   = require('fs-extra')
const dp   = require('./deployconf-manager')
const path = require('path')
const yaml = require('js-yaml')

module.exports = {
  create,
  ensure,
  exists,
  read,
  addFile,
  removeFile,
  updateFile,
  fileExists,
  fileEdited,
  lock,
  unlock,
  rename,
  changeTitle,
  chFileName
}

// Create a new change file
function create(chDir, name, title = '') {
  const newChanges = {
    name,
    title,
    changes : [],
    lock    : false
  }
  getChangesFile(chDir)
  return fs.open(getChangesFile(chDir), 'wx')
    .then(chFile => fs.writeJson(chFile, newChanges))
    .then(() => newChanges )
}

// If no change file is found create a new one in the current directory
function ensure(chDir) {
  if (! exists(chDir)) {
    return create(chDir, path.basename(chDir))
  } 
}

// Checks if changes file exists in the directory or in any of its parents
function exists(chDir) {
  return findChangesFile(chDir) !== '' 
}

// Read the contents of the change file
async function read(chDir) {
  const chFile    = findChangesFile(chDir)
  if (!chFile) {
    return null
    // throw new Error('No changes file')
  }
  const chContent = await fs.readFile(chFile)
  const fileType  = chFileType(chDir)
  const unpack    = {
    'json': content => JSON.parse(content),
    'yaml': content => yaml.safeLoad(content)
  }
  return (unpack[fileType] || JSON.parse)(chContent)
    
}

// Add a new file to the changes list
function addFile(chDir, fileSrc) {
  const currentTime = new Date(Date.now()).toLocaleString()
  const newF = {
    filename : path.basename(fileSrc),
    path     : path.dirname(fileSrc),
    added    : currentTime,
    changed  : currentTime
  }
  const change = ch => { return {...ch, changes: [...ch.changes, newF] } }
  return update(chDir, change)
}

// Remove a file from the changes list
function removeFile(chDir, fileDel) {
  const change = ch => {
    const chIdx = ch.changes.findIndex(file => path.join(file.path, file.filename) === path.join(fileDel));
    if (chIdx !== -1) {
      return { ...ch,
        changes: [
          ...ch.changes.slice(0, chIdx), 
          ...ch.changes.slice(chIdx + 1, ch.changes.length)
        ]
      }
    } else {
      return { ...ch }
    }
  }
  return update(chDir, change)
}

// Update the change date of a file in the changes list
function updateFile(chDir, fileSrc) {
  const currentTime = new Date(Date.now()).toLocaleString()
  const change      = ch => {
    const chIdx = ch.changes.findIndex(file => path.join(file.path, file.filename) === path.join(fileSrc));
    if (chIdx !== -1) {
      return { ...ch,
        changes: [
          ...ch.changes.slice(0, chIdx), 
          {...ch.changes[chIdx], changed: currentTime },
          ...ch.changes.slice(chIdx + 1, ch.changes.length)
        ]
      }
    } else {
      return { ...ch }
    }
  }
  return update(chDir, change)
}

// Checks if the file exists in the change list
async function fileExists(chDir, fileSrc) {
  const changes = (await read(chDir)).changes
	return changes.some(file => path.join(file.path, file.filename) === path.join(fileSrc) )
}

// Checks is the file has been edited
async function fileEdited(chDir, fileSrc) {
  const changes = (await read(chDir)).changes
  const change  = changes.find(file => path.join(file.path, file.filename) === path.join(fileSrc));

  return change.added !== change.changed
}

// Set the lock in the change
function lock(chDir) {
  const change = ch => { return {...ch, lock: true } }
  return update(chDir, change)
}

// Unset the lock in the change
function unlock(chDir) {
  const change = ch => { return {...ch, lock: false } }
  return update(chDir, change)
}

// Rename the change
function rename(chDir, newName) {
  const change = ch => { return {...ch, name: newName } }
  return update(chDir, change)
}

// Change the title of the change
function changeTitle(chDir, newTitle) {
  const change = ch => { return {...ch, name: newTitle } }
  return update(chDir, change)
}

// Returns the name of the changes file (ex.: changes.json)
function chFileName(chDir) {
  try {
    return dp.readSync(chDir).changesFile.filename
  } catch(e) {
    return fs.readJsonSync(path.join(__dirname, '../../config.json')).changesFile.filename
  }
}

//
// Not exported functions
//

// Update and overwrite the change file
// The change argument will be applied to the original change object
async function update(chDir, change) {
  const newCh    = await read(chDir).then(ch => change(ch))
  const fileType = chFileType(chDir)
  const pack     = {
    'json': content => JSON.stringify(content, null, 4),
    'yaml': content => yaml.safeDump(content)
  }
  const chContent = (pack[fileType] || JSON.stringify)(newCh)
	return fs.writeFile(findChangesFile(chDir), chContent, 'utf8')
}

// Create the full path of the changes file
function getChangesFile(chDir) {
	return path.join(chDir, chFileName(chDir))
}

// Find the changes file in current directory, or any of its parents
// If nothing found and empty string is returned
function findChangesFile(chDir) {
  if (chDir === '/' || chDir === '') {
    return ''
  } else if (fs.existsSync(getChangesFile(chDir))) {
    return getChangesFile(chDir)
  } else {
    return findChangesFile(path.dirname(chDir))
  }
}

// Returns the file type of the change file (ex.: json, yaml)
function chFileType(chDir) {
  try {
    return dp.readSync(chDir).changesFile.filetype
  } catch(e) {
    return fs.readJsonSync(path.join(__dirname, '../../config.json')).changesFile.filetype
  }
}
