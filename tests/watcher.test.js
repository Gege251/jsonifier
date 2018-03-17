
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

  test('Change a file while watched', async () => {

    const app = watcher('/test/testpack')
    await waitForConsole()

    await fs.appendFile('/source/testfile1', ' edited')
    await waitForConsole()

    expect(assertFile('/test/testpack/edited/testfile1')).toBe('This is file 1 edited')
    expect(console.log.mock.calls[0][0]).toMatch(/Watching/i)

    emulateInput('exit')
    await app
  })

  test('Attempt to start watcher while locked', async () => {
    const app = watcher('/test/testpack4')
    await waitForConsole()

    expect(console.log.mock.calls[0][0]).toMatch('locked')
    await app
  })

  test('Attempt to start watcher in an empty change', async () => {
    const app = watcher('/test/testpack3')
    await waitForConsole()

    expect(console.log.mock.calls[0][0]).toMatch('empty')
    await app
  })

  test.skip('List files', async () => {
    const app = watcher('/test/testpack')
    await waitForConsole()

    emulateInput('ls')
    await waitForConsole()
    expect(console.log.mock.calls[1][0]).toMatch('testfile1')
    expect(console.log.mock.calls[1][0]).toMatch('testfile2')

    emulateInput('exit')
    await app
  })

  test.skip('Add new file', async () => {
    const app = watcher('/test/testpack')
    await waitForConsole()

    emulateInput('+ newfile1')
    await waitForConsole()
    expect(console.log.mock.calls[1][0]).toMatch('added')

    emulateInput('exit')
    await app
  })

  test.skip('Remove a file', async () => {
    const app = watcher('/test/testpack')
    await waitForConsole()

    emulateInput('- /testfile1')
    await waitForConsole()
    expect(console.log.mock.calls[1][1]).toMatch('deleted')

    emulateInput('exit')
    await app
  })
})

function assertFile(filepath) {
  return fs.vol.toJSON()[filepath]
}

function emulateInput(inputstr) {
  process.stdin.read = jest.fn()
  process.stdin.read.mockReturnValueOnce(inputstr)
  process.stdin.emit('readable')
}

async function waitForConsole() {
  await new Promise((resolve) => setup.consoleSpy.on('called', resolve) )
}
