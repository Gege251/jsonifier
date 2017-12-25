const path = require('path')

// Mocking the file system
jest.mock('fs')
const fs   = require('fs-extra')

beforeAll(() => {
  const mockConfigPath = path.join(__dirname, '../config.json')
  
  const mockConfig     = JSON.stringify({
    changesFile: {
      filename: 'changes.json',
      filetype: 'json'
    },
    deployconfFile: {
      filename: '.deployconf',
      filetype: 'json'
    }
  })

  const mockDeployConf = JSON.stringify({
    name      : 'Testdeploy',
    source    : '/source',
    original  : 'original',
    edited    : 'edited',
    archive   : 'archive',
    otherDirs : []
  })

  const mockFileSystem = {
    '/source/folder1/file1'                 : 'This is file 1',
    '/source/folder1/file2'                 : 'This is file 2',
    '/source/folder1/folder2/folder3/file3' : 'This is file 3',
    '/test/testpack/deeply/nested'          : '',
    '/test/testpack2/'                      : '',
    '/dummy/'                               : '',
    [mockConfigPath]                        : mockConfig,
    '/test/.deployconf'                     : mockDeployConf
  }

  fs.vol.fromJSON(mockFileSystem)
})

//
// TESTS
//

describe('Add file', () => {
  const addToChange = require('../src/add-to-change')

//   test('Add a file from source', async () => {
//     expect.assertions(1)
// 
//     await addToChange('/test/testpack', '/folder1/file1')
//     const chFile = fs.readJsonSync('/test/testpack/changes.json')
//     expect(chFile.changes.length).toBe(1)
//   })
})
