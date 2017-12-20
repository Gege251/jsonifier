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

function create(directory) {
  const newChanges = {
    name: path.basename(directory),
    title: '',
    changes: []
  }
  getChangesFile(directory)
  return fs.open(getChangesFile(directory), 'wx')
    .then(chFile => fs.writeJson(newChanges))
    .then(_ => newChanges )
}

function ensure(directory) {
	return findChangesFile(directory) != ''
}

function read(directory) {
	return fs.open(findChangesFile(directory), 'r')
    .then(chFile => fs.readJson(chFile))
}

function readOrCreate(directory) {
  if (ensure(directory)) {
    return read(directory)
  } else {
    return create(directory)
  }
}

function addFile() {
}

function removeFile() {
}

function updateFile() {
}

function lock(directory) {
  const newCh = read(directory).then(ch => {...ch, lock: true})
	fs.writeJson(changesFile, newCh, {spaces: 4})
}

function unlock() {
}

function rename() {
}

function changeTitle() {
}

function update() {
}

function getChangesFile(directory) {
	return path.join(directory, 'changes.json')
}

function findChangesFile(directory) {
  if (directory === '/' || directory === '') {
    return ''
  } else if (fs.existsSync(getChangesFile(directory))) {
    return getChangesFile(directory)
  } else {
    return findChangesFile(path.dirname(directory))
  }
	return path.join(directory, 'changes.json')
}
