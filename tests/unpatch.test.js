
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

describe('Unpatch', () => {
  const unpatch = require('../src/unpatch.js')

  test('Unpatching to original version', async () => {
    await unpatch('/test/testpack')

    expect(assertFile('/source/folder1/testfile2')).toBe('This is file 2')
    expect(assertJson('/test/testpack/changes.json').lock).toBeTruthy()
  })
})

function assertJson(filepath) {
  return JSON.parse(fs.vol.toJSON()[filepath])
}

function assertFile(filepath) {
  return fs.vol.toJSON()[filepath]
}
