
// Mocks

jest.mock('fs')

const path = require('path')
const fs   = require('fs-extra')

// Setup

beforeEach(() => {
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
    name            : 'Testdeploy',
    source          : '/source',
    originalVersion : '/original',
    editedVersion   : '/edited',
    archive         : 'archive',
    otherDirs       : []
  })

  const mockChFile     = JSON.stringify({
    name    : 'noname',
    title   : '',
    changes : [],
    lock    : false
  })

  const mockFileSystem = {
    '/source/testfile1'                         : 'This is file 1',
    '/source/folder1/testfile2'                 : 'This is file 2',
    '/source/folder1/folder2/folder3/testfile3' : 'This is file 3',
    [mockConfigPath]                            : mockConfig,
    '/test/.deployconf'                         : mockDeployConf,
    '/test/testpack/changes.json'               : mockChFile
  }

  fs.vol.fromJSON(mockFileSystem)

  console.log = jest.fn()
})

// Teardown

afterEach(() => {
  fs.vol.reset()
})

// Tests

describe('Add file', () => {
  const addToChange = require('../src/add-to-change')


  test('Adding files to changes folder', async () => {

    await addToChange('/test/testpack', '/testfile1')
    await addToChange('/test/testpack', '/folder1/testfile2')
    await addToChange('/test/testpack', '/folder1/folder2/folder3/testfile3')
    const chFile = fs.readJsonSync('/test/testpack/changes.json')

    expect.assertions(7)
    expect(chFile.changes.length).toBe(3)
    expect(fs.existsSync('/test/testpack/original/testfile1')).toBeTruthy()
    expect(fs.existsSync('/test/testpack/original/folder1/testfile2')).toBeTruthy()
    expect(fs.existsSync('/test/testpack/original/folder1/folder2/folder3/testfile3')).toBeTruthy()

    expect(fs.existsSync('/test/testpack/edited/testfile1')).toBeTruthy()
    expect(fs.existsSync('/test/testpack/edited/folder1/testfile2')).toBeTruthy()
    expect(fs.existsSync('/test/testpack/edited/folder1/folder2/folder3/testfile3')).toBeTruthy()
  })


  test('Terminal success message', async () => {

    await addToChange('/test/testpack', '/folder1/testfile2')

    expect.assertions(2)
    expect(console.log.mock.calls[0][0]).toMatch(/added/)
    expect(console.log.mock.calls[1][0]).toMatch(/updated/)
  })


  test('Attempting to add an already added file', async () => {

    const currentDate = new Date(Date.UTC(2017,0,1)).toLocaleString()
    const chFile = {
      name    : 'noname',
      title   : '',
      changes : [
        {
          filename : 'testfile1',
          path     : '/',
          added    : currentDate,
          changed  : currentDate
        }
      ],
      lock    : false
    }

    fs.vol.fromJSON({'/test/testpack/changes.json': JSON.stringify(chFile)})

    await addToChange('/test/testpack', '/testfile1')
    const chResult = fs.readJsonSync('/test/testpack/changes.json')

    expect.assertions(2)
    expect(chResult.changes.length).toBe(1)
    expect(console.log.mock.calls[0][0]).toMatch(/already/)
  })


  test('Attempting to add a non-existent file', async () => {

    await addToChange('/test/testpack', '/folder1/nonexistent')

    const chResult = fs.readJsonSync('/test/testpack/changes.json')

    expect.assertions(2)
    expect(chResult.changes.length).toBe(0)
    expect(console.log.mock.calls[0][0]).toMatch(/doesn\'t exist/)
  })


})
