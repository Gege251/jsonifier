const fs   = require('fs-extra')
const path = require('path')

module.exports = {
  create,
  ensure,
  read,
  readOrCreate,
  addFile,
  removeFile,
  updateFile,
  lock,
  unlock,
  rename,
  changeTitle
}

// Create a new change file
function create(chDir) {
  const newChanges = {
    name    : path.basename(chDir),
    title   : '',
    changes : [],
    lock    : false
  }
  getChangesFile(chDir)
  return fs.open(getChangesFile(chDir), 'wx')
    .then(chFile => fs.writeJson(newChanges))
    .then(_ => newChanges )
}

// Check if change file exists
function ensure(chDir) {
	return findChangesFile(chDir) != ''
}

// Read the contents of the change file
function read(chDir) {
	return fs.open(findChangesFile(chDir), 'r')
    .then(chFile => fs.readJson(chFile))
}

// Read the contents of the change file or create a new if doesn't exist
function readOrCreate(chDir) {
  if (ensure(chDir)) {
    return read(chDir)
  } else {
    return create(chDir)
  }
}

// Add a new file to the changes list
function addFile(chDir, fileSrc) {
  const currentTime = new Date().toLocaleString()
  const newF = {
    filename : path.basename(fileSrc),
    path     : path.dirname(fileSrc),
    added    : currentTime,
    changed  : currentTime
  }
  const change = ch => { return {...ch, changes: [...ch.changes, newF] } }
  update(chDir, change)
}

// Remove a file from the changes list
function removeFile(chDir, fileDel) {
  const change = ch => {
    const chIdx = changes.findIndex(file => path.join(file.path, file.filename) === path.join(fileDel));
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
  update(chDir, change)
}

// Update the change date of a file in the changes list
function updateFile(chDir) {
  const currentTime = new Date().toLocaleString()
  const change = ch => {
    const chIdx = changes.findIndex(file => path.join(file.path, file.filename) === path.join(fileDel));
    if (chIdx !== -1) {
      return { ...ch,
        changes: [
          ...ch.changes.slice(0, chIdx), 
          ...ch.changes[chIdx], changed = currentTime, 
          ...ch.changes.slice(chIdx + 1, ch.changes.length)
        ]
      }
    } else {
      return { ...ch }
    }
  }
  update(chDir, change)
}

// Set the lock in the change
function lock(chDir) {
  const change = ch => { return {...ch, lock: true } }
  update(chDir, change)
}

// Unset the lock in the change
function unlock(chDir) {
  const change = ch => { return {...ch, lock: false } }
  update(chDir, change)
}

// Rename the change
function rename(chDir, newName) {
  const change = ch => { return {...ch, name: newName } }
  update(chDir, change)
}

// Change the title of the change
function changeTitle(chDir, newTitle) {
  const change = ch => { return {...ch, name: newTitle } }
  update(chDir, change)
}

//
// Not exported functions
//

// Update and overwrite the change file
// The change argument is a function which is applied to the original
// contents of the file
function update(chDir, change) {
  const newCh = read(chDir).then(ch => change(ch))
	fs.writeJson(findChangesFile(chDir), newCh, {spaces: 4})
}

// Create the full path of the changes file
function getChangesFile(chDir) {
	return path.join(chDir, 'changes.json')
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
