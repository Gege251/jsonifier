
// Mocks and imports

jest.mock('fs')

const path  = require('path')
const fs    = require('fs-extra')
const setup = require('./setup')

// Setup

beforeEach(() => {
  setup.init()
})

// Teardown

afterEach(() => {
  setup.teardown()
})

// Tests

describe('Deployconf manager', () => {
  const dp = require('../src/utils/deployconf-manager')

  test('Reading deployconf file', async () => {
    expect.assertions(3)

    const expectedDpConf = setup.mockObjects.deployConf

    expect(await dp.read('/test')).toEqual(expectedDpConf)
    expect(await dp.read('/test/testpack/folder1/folder2')).toEqual(expectedDpConf)
    expect(dp.read('/dummy')).rejects.toThrow('No deployconf file')
  })

})


describe('Change manager - change file functions', () => {
  const ch = require('../src/utils/change-manager')

  test('Create a new changes file', async () => {

    await ch.create('/test/testpack2', 'newchangefolder')

    expect.assertions(2)
    expect(fs.existsSync('/test/testpack2/changes.json')).toBeTruthy()
    expect(fs.readJsonSync('/test/testpack2/changes.json').name).toBe('newchangefolder')
  })


  test('Ensuring changes file', async () => {

    await ch.ensure('/test/testpack')
    await ch.ensure('/test/testpack2')

    expect.assertions(2)
    expect(fs.readJsonSync('/test/testpack/changes.json').name).toBe('noname')
    expect(fs.readJsonSync('/test/testpack2/changes.json').name).toBe('testpack2')
  })


  test('Reading changes file', async () => {

    const expectedChFile = setup.mockObjects.chFile

    expect.assertions(3)
    expect(await ch.read('/test/testpack')).toEqual(expectedChFile)
    expect(await ch.read('/test/testpack/folder1/folder2/folder3')).toEqual(expectedChFile)
    expect(ch.read('/dummy')).rejects.toThrow('No changes file!')
  })

})

describe('Change manager - file list manipulation', () => {
  const ch = require('../src/utils/change-manager')

  test('Adding a file', async () => {

    await ch.addFile('/test/testpack', '/newfile1')
    await ch.addFile('/test/testpack', '/newfolder1/newfile2')

    const expectedChanges = [
      ...setup.mockObjects.chFile.changes,
      {
        filename : 'newfile1',
        path     : '/',
        added    : setup.mockObjects.currentDate.toLocaleString(),
        changed  : setup.mockObjects.currentDate.toLocaleString()
      },
      {
        filename : 'newfile2',
        path     : '/newfolder1',
        added    : setup.mockObjects.currentDate.toLocaleString(),
        changed  : setup.mockObjects.currentDate.toLocaleString()
      }
    ]

    expect.assertions(2)
    expect(fs.readJsonSync('/test/testpack/changes.json').changes.length).toBe(5)
    expect(fs.readJsonSync('/test/testpack/changes.json').changes).toEqual(expectedChanges)
  })


  test('Removing a file', async () => {

    await ch.removeFile('/test/testpack', '/folder1/testfile2')

    expect.assertions(1)
    expect(fs.readJsonSync('/test/testpack/changes.json').changes.length).toBe(2)
  })


  test('Updating a file', async () => {

    const newDate = setup.mockObjects.newDate
    Date.now = jest.fn(() => newDate)

    await ch.updateFile('/test/testpack', '/testfile1')
    const chResult = fs.readJsonSync('/test/testpack/changes.json')

    expect.assertions(1)
    expect(chResult.changes[0].changed).toBe(newDate.toLocaleString())
  })


  test('Checking if file exists', async () => {
    expect.assertions(2)

    expect(await ch.fileExists('/test/testpack', '/testfile1')).toBeTruthy()
    expect(await ch.fileExists('/test/testpack', '/testfile2')).toBeFalsy()
  })

   
  test('Checking if edited', async () => {
    expect.assertions(2)

    expect(await ch.fileEdited('/test/testpack', '/testfile1')).toBeFalsy()
    expect(await ch.fileEdited('/test/testpack', '/folder1/testfile2')).toBeTruthy()
  })


})

