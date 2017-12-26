
// Mock file system

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
    source          : '/testsource',
    originalVersion : 'original',
    editedVersion   : 'edited',
    archive         : 'archive',
    otherDirs       : []
  })

  const chFile1 = JSON.stringify({
    name    : 'noname',
    title   : '',
    changes : [],
    lock    : false
  })

  const currentDate = new Date(Date.UTC(2017,0,1)).toLocaleString()
  const chFile2 = JSON.stringify({
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
        path     : '/testfolder',
        added    : currentDate,
        changed  : currentDate
      }
    ],
    lock    : false
  })

  const mockFileSystem = {
    '/test/testpack1/changes.json'  : chFile1,
    '/test/testpack1/deeply/nested' : '',
    '/test/testpack2/changes.json'  : chFile2,
    '/test/testpack3/'              : '',
    '/dummy/'                       : '',
    [mockConfigPath]                : mockConfig,
    '/test/.deployconf'             : mockDeployConf
  }

  fs.vol.fromJSON(mockFileSystem)

  Date.now = jest.fn(() => new Date(currentDate).valueOf())
})

// Teardown

afterEach(() => {
    fs.vol.reset()
})

// Tests

describe('Config managers', () => {
  const ch = require('../src/utils/change-manager')
  const dp = require('../src/utils/deployconf-manager')


  test('Create a new changes file', async () => {

    await ch.create('/test/testpack3', 'newchangefolder')

    expect.assertions(2)
    expect(fs.existsSync('/test/testpack3/changes.json')).toBeTruthy()
    expect(fs.readJsonSync('/test/testpack3/changes.json').name).toBe('newchangefolder')
  })


  test('Ensuring changes file', async () => {

    await ch.ensure('/test/testpack1')
    await ch.ensure('/test/testpack3')

    expect.assertions(2)
    expect(fs.readJsonSync('/test/testpack1/changes.json').name).toBe('noname')
    expect(fs.readJsonSync('/test/testpack3/changes.json').name).toBe('testpack3')
  })

  test('Reading changes file', async () => {

    const chFile = {
      name    : 'noname',
      title   : '',
      changes : [],
      lock    : false
    }

    expect.assertions(3)
    expect(await ch.read('/test/testpack1')).toEqual(chFile)
    expect(await ch.read('/test/testpack1/deeply/nested')).toEqual(chFile)
    expect(ch.read('/dummy')).rejects.toThrow('No changes file!')
  })


  test('Adding a file to changes list', async () => {

    await ch.addFile('/test/testpack1', '/testfile1')
    await ch.addFile('/test/testpack1', '/testfolder/testfile2')

    const currentDate = new Date(Date.UTC(2017,0,1)).toLocaleString()
    const expectedChanges = [
      {
        filename : 'testfile1',
        path     : '/',
        added    : currentDate,
        changed  : currentDate
      },
      {
        filename : 'testfile2',
        path     : '/testfolder',
        added    : currentDate,
        changed  : currentDate
      }
    ]

    expect.assertions(1)
    expect(fs.readJsonSync('/test/testpack1/changes.json').changes).toEqual(expectedChanges)
  })


  test('Removing a file from changes list', async () => {

    await ch.removeFile('/test/testpack2', '/testfolder/testfile2')

    expect.assertions(1)
    expect(fs.readJsonSync('/test/testpack2/changes.json').changes.length).toBe(1)
  })


  test('Updating a file in the changes list', async () => {

    const newDate = new Date(Date.UTC(2017,0,2)).valueOf()
    Date.now = jest.fn(() => newDate)

    await ch.updateFile('/test/testpack2', '/testfile1')
    const chResult = fs.readJsonSync('/test/testpack2/changes.json')

    expect.assertions(1)
    expect(chResult.changes[0].changed).toBe(new Date(newDate).toLocaleString())
  })


  test('Checking if file exists', async () => {
    expect.assertions(2)

    await ch.addFile('/test/testpack2', '/testfile1')
    expect(await ch.fileExists('/test/testpack2', '/testfile1')).toBeTruthy()
    expect(await ch.fileExists('/test/testpack2', '/testfile2')).toBeFalsy()
  })

   
  test('Checking if file has been edited', async () => {
    expect.assertions(2)

    const currentDate = new Date(Date.UTC(2017,0,1)).toLocaleString()
    const newDate = new Date(Date.UTC(2017,0,2)).valueOf()
    const chFile = {
      name    : 'noname',
      title   : '',
      changes : [
        {
          filename : 'testfile1',
          path     : '/',
          added    : currentDate,
          changed  : newDate
        },
        {
          filename : 'testfile2',
          path     : '/testfolder',
          added    : currentDate,
          changed  : currentDate
        }
      ],
      lock    : false
    }

    fs.vol.fromJSON({'/test/testpack/changes.json': JSON.stringify(chFile)})

    expect(await ch.fileEdited('/test/testpack', '/testfile1')).toBeTruthy()
    expect(await ch.fileEdited('/test/testpack', '/testfolder/testfile2')).toBeFalsy()
  })


  test('Reading deployconf file', async () => {
    expect.assertions(3)

    const expectedFile = {
      name            : 'Testdeploy',
      source          : '/testsource',
      originalVersion : 'original',
      editedVersion   : 'edited',
      archive         : 'archive',
      otherDirs       : []
    }
    expect(await dp.read('/test')).toEqual(expectedFile)
    expect(await dp.read('/test/testpack/deeply/nested')).toEqual(expectedFile)
    expect(dp.read('/dummy')).rejects.toThrow('No deployconf file')
  })


})
