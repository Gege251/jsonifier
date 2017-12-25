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
    source    : '/testsource',
    original  : 'original',
    edited    : 'edited',
    archive   : 'archive',
    otherDirs : []
  })

  const mockFileSystem = {
    '/test/testpack/deeply/nested' : '',
    '/test/testpack2/'             : '',
    '/dummy/'                      : '',
    [mockConfigPath]               : mockConfig,
    '/test/.deployconf'            : mockDeployConf
  }

  fs.vol.fromJSON(mockFileSystem)
})

//
// TESTS
//

describe('Config managers', () => {
  const ch = require('../src/utils/change-manager')
  const dp = require('../src/utils/deployconf-manager')

  test('Create a new changes file', async () => {
    expect.assertions(1)

    await ch.create('/test/testpack', 'noname')
    expect(fs.existsSync('/test/testpack/changes.json')).toBeTruthy()
  })

  test('Ensuring changes file', async () => {
    expect.assertions(2)

    await ch.ensure('/test/testpack')
    await ch.ensure('/test/testpack2')

    expect(fs.readJsonSync('/test/testpack/changes.json').name).toBe('noname')
    expect(fs.readJsonSync('/test/testpack2/changes.json').name).toBe('testpack2')
  })

  test('Reading changes file', async () => {
    expect.assertions(3)

    const expectedFile = {
      name: 'noname',
      title: '',
      changes: [],
      lock: false
    }
    expect(await ch.read('/test/testpack')).toEqual(expectedFile)
    expect(await ch.read('/test/testpack/deeply/nested')).toEqual(expectedFile)

    expect(ch.read('/dummy')).rejects.toThrow('No changes file!')
  })

  test('Adding a file to changes list', async () => {
    expect.assertions(9)

    const mockDate = new Date(Date.UTC(2017,0,1)).valueOf()
    Date.now = jest.fn(() => mockDate)

    await ch.addFile('/test/testpack', '/testfile1')
    await ch.addFile('/test/testpack', '/testfolder/testfile2')
    const chFile = fs.readJsonSync('/test/testpack/changes.json')

    expect(chFile.changes.length).toBe(2)

    expect(chFile.changes[0].filename).toBe('testfile1')
    expect(chFile.changes[0].path).toBe('/')
    expect(chFile.changes[0].added).toBe(new Date(mockDate).toLocaleString())
    expect(chFile.changes[0].changed).toBe(new Date(mockDate).toLocaleString())

    expect(chFile.changes[1].filename).toBe('testfile2')
    expect(chFile.changes[1].path).toBe('/testfolder')
    expect(chFile.changes[1].added).toBe(new Date(mockDate).toLocaleString())
    expect(chFile.changes[1].changed).toBe(new Date(mockDate).toLocaleString())
  })

  test('Removing a file from changes list', async () => {
    expect.assertions(1)

    await ch.removeFile('/test/testpack', '/testfolder/testfile2')
    const chFile = fs.readJsonSync('/test/testpack/changes.json')

    expect(chFile.changes.length).toBe(1)
  })

  test('Updating a file in the changes list', async () => {
    expect.assertions(1)

    const mockDate = new Date(Date.UTC(2017,0,2)).valueOf()
    Date.now = jest.fn(() => mockDate)

    await ch.updateFile('/test/testpack', '/testfile1')
    const chFile = fs.readJsonSync('/test/testpack/changes.json')
    expect(chFile.changes[0].changed).toBe(new Date(mockDate).toLocaleString())

  })

  test('Checking if file exists', async () => {
    expect.assertions(2)

    expect(await ch.fileExists('/test/testpack', '/testfile1')).toBeTruthy()
    expect(await ch.fileExists('/test/testpack', '/testfile2')).toBeFalsy()
  })

  test('Checking if file has been edited', async () => {
    expect.assertions(2)

    await ch.addFile('/test/testpack', '/testfile2')
    expect(await ch.fileEdited('/test/testpack', '/testfile1')).toBeTruthy()
    expect(await ch.fileEdited('/test/testpack', '/testfile2')).toBeFalsy()
  })

  test('Reading deployconf file', async () => {
    expect.assertions(3)

    const expectedFile = {
      name      : 'Testdeploy',
      source    : '/testsource',
      original  : 'original',
      edited    : 'edited',
      archive   : 'archive',
      otherDirs : []
    }
    expect(await dp.read('/test')).toEqual(expectedFile)
    expect(await dp.read('/test/testpack/deeply/nested')).toEqual(expectedFile)
    expect(dp.read('/dummy')).rejects.toThrow('No deployconf file')
  })
})
