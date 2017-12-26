
// Mocks

jest.mock('fs')
jest.mock('../src/utils/areyousure', () => {
  return jest.fn((msg, action) => Promise.resolve(action()))
})

const path       = require('path')
const fs         = require('fs-extra')
const areyousure = require('../src/utils/areyousure')
const setup      = require('./setup')

// Setup

beforeEach(() => {
  setup.init()
})

// Teardown

afterEach(() => {
  setup.teardown()
})

// Tests

describe('Remove file', () => {
  const removeFromChange = require('../src/remove-from-change')


  test('Remove files from changes folder', async () => {

    await removeFromChange('/test/testpack', '/testfile1')

    const chResult = fs.readJsonSync('/test/testpack/changes.json')

    expect.assertions(3)
    expect(chResult.changes.length).toBe(2)
    expect(fs.existsSync('/test/testpack/original/testfile1')).toBeFalsy()
    expect(fs.existsSync('/test/testpack/edited/testfile1')).toBeFalsy()
  })


  test('Terminal success message', async () => {

    await removeFromChange('/test/testpack', '/testfile1')

    expect.assertions(3)
    expect(console.log.mock.calls[0][0]).toBe('/testfile1')
    expect(console.log.mock.calls[0][1]).toMatch(/deleted/)
    expect(console.log.mock.calls[1][0]).toMatch(/updated/)
  })


  test('Removing deeply nested file (cleanup empty folders)', async () => {
    
    await removeFromChange('/test/testpack', '/folder1/folder2/folder3/testfile3')

    expect.assertions(4)
    expect(fs.existsSync('/test/testpack/original/folder1/folder2')).toBeFalsy()
    expect(fs.existsSync('/test/testpack/original/folder1')).toBeTruthy()
    expect(fs.existsSync('/test/testpack/edited/folder1/folder2')).toBeFalsy()
    expect(fs.existsSync('/test/testpack/edited/folder1')).toBeTruthy()
  })
  

  test('Remove a changed file (console prompt)', async () => {

    await removeFromChange('/test/testpack', '/folder1/testfile2')

    expect.assertions(3)
    expect(areyousure.mock.calls.length).toBe(1)
    expect(fs.existsSync('/test/testpack/original/folder1/testfile2')).toBeFalsy()
    expect(fs.existsSync('/test/testpack/edited/folder1/testfile2')).toBeFalsy()
    
  })


  test('Attempting to remove a not added file', async () => {
    
    await removeFromChange('/test/testpack', '/testfile3')

    const chResult = fs.readJsonSync('/test/testpack/changes.json')

    expect.assertions(2)
    expect(chResult.changes.length).toBe(3)
    expect(console.log.mock.calls[0][0]).toMatch(/not registered/)
  })

})
