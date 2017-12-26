const fs   = require('fs-extra')
const path = require('path')

module.exports = { init, teardown }

const currentDate = new Date(Date.UTC(2017,0,1)).toLocaleString()
const newDate     = new Date(Date.UTC(2017,0,2)).toLocaleString()
const mockObjects = {
  config: JSON.stringify({
    changesFile: {
      filename: 'changes.json',
      filetype: 'json'
    },
    deployconfFile: {
      filename: '.deployconf',
      filetype: 'json'
    }
  }),


  deployConf: JSON.stringify({
    name            : 'Testdeploy',
    source          : '/source',
    originalVersion : '/original',
    editedVersion   : '/edited',
    archive         : 'archive',
    otherDirs       : []
  }),


  chFile: JSON.stringify({
    name    : 'noname',
    title   : '',
    changes : [
        {
          filename : 'testfile1',
          path     : '/',
          added    : currentDate,
          changed  : currentDate
        },
        {
          filename : 'testfile2',
          path     : '/folder1',
          added    : currentDate,
          changed  : newDate
        },
        {
          filename : 'testfile3',
          path     : '/folder1/folder2/folder3',
          added    : currentDate,
          changed  : currentDate
        }
    ],
    lock    : false
  })
}

function init(additionalFiles) {

  const mockConfigPath = path.join(__dirname, '../config.json')

  const mockFileSystem = {
    '/source/testfile1'                                         : 'This is file 1',
    '/source/folder1/testfile2'                                 : 'This is file 2',
    '/source/folder1/folder2/folder3/testfile3'                 : 'This is file 3',
    '/source/newfile1'                                          : 'This is a new file 1',
    '/source/newfolder1/newfile2'                               : 'This is a new file 2',
    '/source/newfolder1/newfolder2/newfolder3/newfile3'         : 'This is a new file 3',
    [mockConfigPath]                                            : mockObjects.config,
    '/test/.deployconf'                                         : mockObjects.deployConf,
    '/test/testpack/changes.json'                               : mockObjects.chFile,
    '/test/testpack/original/testfile1'                         : 'This is file 1',
    '/test/testpack/original/folder1/testfile2'                 : 'This is file 2',
    '/test/testpack/original/folder1/folder2/folder3/testfile3' : 'This is file 3',
    '/test/testpack/edited/testfile1'                           : 'This is file 1',
    '/test/testpack/edited/folder1/testfile2'                   : 'This is file 2 edited',
    '/test/testpack/edited/folder1/folder2/folder3/testfile3'   : 'This is file 3',
    '/test/testpack2/'                                          : ''
  }

  fs.vol.fromJSON(mockFileSystem)

  console.log = jest.fn()
}

function teardown() {
  fs.vol.reset()
}
