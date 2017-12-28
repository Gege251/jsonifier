
// Mocks and imports

jest.mock('fs')

const path    = require('path')
const fs      = require('fs-extra')
const setup   = require('./setup')

// Setup

beforeEach(() => {
  setup.init()
})

// Teardown

afterEach(() => {
  setup.teardown()
})

// Tests

describe('Creating change folder directories', () => {
  const createDirs = require('../src/create-dirs')

  test('Creating dirs', async () => {

    await createDirs('/test/testpack2')

    expect.assertions(5)
    expect(fs.existsSync('/test/testpack2/original')).toBeTruthy()
    expect(fs.existsSync('/test/testpack2/edited')).toBeTruthy()
    expect(fs.existsSync('/test/testpack2/other1')).toBeTruthy()
    expect(fs.existsSync('/test/testpack2/other2')).toBeTruthy()
    expect(console.log.mock.calls[0][0]).toMatch('original')

  })

  test('Attempting to create dirs inside an existing change folder', async () => {

    await createDirs('/test/testpack/edited')

    expect.assertions(2)
    expect(fs.existsSync('/test/testpack/edited/original')).toBeFalsy()
    expect(console.log.mock.calls[0][0]).toMatch('already')
  })

})
