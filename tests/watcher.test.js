
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

describe('Watcher module', () => {
  const watcher      = require('../src/watcher.js')

  beforeEach(() => {
    process.stdin.read = jest.fn()
    process.stdin.read.mockReturnValueOnce('exit\n')
  })


  test('Change a file while watched', async () => {
    const app = watcher('/test/testpack')
    await new Promise((resolve) => setup.consoleSpy.on('called', resolve) )

    await fs.appendFile('/source/testfile1', ' edited')
    await new Promise((resolve) => setup.consoleSpy.on('called', resolve) )

    expect(assertFile('/test/testpack/edited/testfile1')).toBe('This is file 1 edited')
    expect(console.log.mock.calls[0][0]).toMatch(/Watching/i)
    await app
  })

  test('Attempt to start watcher while locked', async () => {
    const watch = watcher('/test/testpack4')
    await new Promise((resolve) => setup.consoleSpy.on('called', resolve) )

    expect(console.log.mock.calls[0][0]).toMatch('locked')
  })

  test.skip('Attempt to start watcher in an empty change', async () => {
    const watch = watcher('/test/testpack3')
    await new Promise((resolve) => setup.consoleSpy.on('called', resolve) )

    expect(console.log.mock.calls[0][0]).toMatch('empty')
  })

  test.skip('List files')

  test.skip('Add new file')

  test.skip('Remove a file')

  test.skip('Error message checks')
})

function assertFile(filepath) {
  return fs.vol.toJSON()[filepath]
}
