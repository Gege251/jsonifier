
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

describe('Archiving a change', () => {
  const archiveChange = require('../src/archive-change')

  test('Creatng an archive and assuring archive directory', async () => {

    expect.assertions(2)
    expect(fs.existsSync('/test/archive')).toBeFalsy()
    await archiveChange('/test/testpack')

    expect(fs.existsSync('/test/archive/2017-1-1_testpack.zip')).toBeTruthy()
  })

  test('Making multiple archives on the same day', async () => {
    
    await archiveChange('/test/testpack')
    await archiveChange('/test/testpack')
    await archiveChange('/test/testpack')

    expect.assertions(3)
    expect(fs.existsSync('/test/archive/2017-1-1_testpack.zip')).toBeTruthy()
    expect(fs.existsSync('/test/archive/2017-1-1_testpack1.zip')).toBeTruthy()
    expect(fs.existsSync('/test/archive/2017-1-1_testpack2.zip')).toBeTruthy()
  })

  test('Assuring terminal messages', async () => {
    await archiveChange('/test/testpack')

    expect(console.log.mock.calls[0][0]).toMatch(/Archiving/)
    expect(console.log.mock.calls[1][1]).toMatch(/testpack/)
  })


})
