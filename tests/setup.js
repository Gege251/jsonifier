const fs           = require('fs-extra')
const path         = require('path')

const EventEmitter = require('events')
const consoleSpy   = new EventEmitter()

// Mock objects

const currentDate = new Date(Date.UTC(2017,0,1))
const newDate     = new Date(Date.UTC(2017,0,2))

const mockObjects = {

  currentDate : currentDate,
  newDate     : newDate,

  config: {
    changesFile: {
      filename: 'changes.json',
      filetype: 'json'
    },
    deployconfFile: {
      filename: '.deployconf',
      filetype: 'json'
    }
  },


  deployConf: {
    name            : 'Testdeploy',
    source          : '/source',
    originalVersion : '/original',
    editedVersion   : '/edited',
    archive         : '/archive',
    otherDirs       : [
      '/other1',
      '/other2'
    ]
  },


  chFile: {
    name    : 'noname',
      title   : '',
      changes : [
        {
          filename : 'testfile1',
          path     : '/',
          added    : currentDate.toLocaleString(),
          changed  : currentDate.toLocaleString()
        },
        {
          filename : 'testfile2',
          path     : '/folder1',
          added    : currentDate.toLocaleString(),
          changed  : newDate.toLocaleString()
        },
        {
          filename : 'testfile3',
          path     : '/folder1/folder2/folder3',
          added    : currentDate.toLocaleString(),
          changed  : currentDate.toLocaleString()
        }
      ],
      lock    : false
  },


  chFile2: {
    name    : 'noname',
      title   : '',
      changes : [],
      lock    : false
  },


  chFile3: {
    name    : 'noname',
      title   : '',
      changes : [
        {
          filename : 'testfile1',
          path     : '/',
          added    : currentDate.toLocaleString(),
          changed  : currentDate.toLocaleString()
        }
      ],
      lock    : true
  },
}

// Init function (to run before each test)

function init(additionalFiles) {

  const mockConfigPath = path.join(__dirname, '../config.json')

  const mockFileSystem = {
    '/source/testfile1'                                         : 'This is file 1',
    '/source/folder1/testfile2'                                 : 'This is file 2 edited',
    '/source/folder1/folder2/folder3/testfile3'                 : 'This is file 3',
    '/source/newfile1'                                          : 'This is a new file 1',
    '/source/newfolder1/newfile2'                               : 'This is a new file 2',
    '/source/newfolder1/newfolder2/newfolder3/newfile3'         : 'This is a new file 3',
    [mockConfigPath]                                            : JSON.stringify(mockObjects.config),
    '/test/.deployconf'                                         : JSON.stringify(mockObjects.deployConf),
    '/test/testpack/changes.json'                               : JSON.stringify(mockObjects.chFile),
    '/test/testpack3/changes.json'                              : JSON.stringify(mockObjects.chFile2),
    '/test/testpack4/changes.json'                              : JSON.stringify(mockObjects.chFile3),
    '/test/testpack/original/testfile1'                         : 'This is file 1',
    '/test/testpack/original/folder1/testfile2'                 : 'This is file 2',
    '/test/testpack/original/folder1/folder2/folder3/testfile3' : 'This is file 3',
    '/test/testpack/edited/testfile1'                           : 'This is file 1',
    '/test/testpack/edited/folder1/testfile2'                   : 'This is file 2 edited',
    '/test/testpack/edited/folder1/folder2/folder3/testfile3'   : 'This is file 3',
    '/test/testpack3/original/folder1/testfile2'                : 'This is file 2 edited',
    '/test/testpack3/edited/folder1/testfile2'                  : 'This is file 2 alternatively edited',
    '/test/testpack4/original/testfile1'                         : 'This is file 1',
    '/test/testpack4/edited/testfile1'                           : 'This is file 1',
    '/test/testpack2/.empty'                                    : ''
  }

  fs.vol.fromJSON(mockFileSystem)

  console.log = jest.fn((...args) => {
    consoleSpy.emit('called', ...args)
  })

  Date.now = jest.fn(() => currentDate)

}

// Teardown function to run after each test

function teardown() {
  fs.vol.reset()
}

// Exports

module.exports = { init, teardown, mockObjects, consoleSpy }
