
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
  const patch = require('../src/patch.js')

  test('Patching to edited version', async () => {
    await patch('/test/testpack3')

    expect(assertFile('/source/folder1/testfile2')).toBe('This is file 2 alternatively edited')
    expect(assertJson('/test/testpack/changes.json').lock).toBeFalsy()
  })
})

function assertJson(filepath) {
  return JSON.parse(fs.vol.toJSON()[filepath])
}

function assertFile(filepath) {
  return fs.vol.toJSON()[filepath]
}
