
// Mocks

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

describe('Add file', () => {
  const addToChange = require('../src/add-to-change')


  test('Adding files to changes folder', async () => {

    await addToChange('/test/testpack', '/newfile1')
    await addToChange('/test/testpack', '/newfolder1/newfile2')
    await addToChange('/test/testpack', '/newfolder1/newfolder2/newfolder3/newfile3')
    const chFile = fs.readJsonSync('/test/testpack/changes.json')

    expect.assertions(7)
    expect(chFile.changes.length).toBe(6)
    expect(fs.existsSync('/test/testpack/original/newfile1')).toBeTruthy()
    expect(fs.existsSync('/test/testpack/original/newfolder1/newfile2')).toBeTruthy()
    expect(fs.existsSync('/test/testpack/original/newfolder1/newfolder2/newfolder3/newfile3')).toBeTruthy()

    expect(fs.existsSync('/test/testpack/edited/newfile1')).toBeTruthy()
    expect(fs.existsSync('/test/testpack/edited/newfolder1/newfile2')).toBeTruthy()
    expect(fs.existsSync('/test/testpack/edited/newfolder1/newfolder2/newfolder3/newfile3')).toBeTruthy()
  })


  test('Terminal success message', async () => {

    await addToChange('/test/testpack', '/newfolder1/newfile2')

    expect.assertions(2)
    expect(console.log.mock.calls[0][0]).toMatch(/added/)
    expect(console.log.mock.calls[1][0]).toMatch(/updated/)
  })


  test('Attempting to add an already added file', async () => {

    const currentDate = new Date(Date.UTC(2017,0,1)).toLocaleString()

    await addToChange('/test/testpack', '/testfile1')
    const chResult = fs.readJsonSync('/test/testpack/changes.json')

    expect.assertions(2)
    expect(chResult.changes.length).toBe(3)
    expect(console.log.mock.calls[0][0]).toMatch(/already/)
  })


  test('Attempting to add a non-existent file', async () => {

    await addToChange('/test/testpack', '/folder1/nonexistent')

    const chResult = fs.readJsonSync('/test/testpack/changes.json')

    expect.assertions(2)
    expect(chResult.changes.length).toBe(3)
    expect(console.log.mock.calls[0][0]).toMatch(/doesn\'t exist/)
  })


})
