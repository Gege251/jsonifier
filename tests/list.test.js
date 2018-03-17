
// Mocks and imports

jest.mock('fs')
jest.mock('../src/utils/areyousure', () => {
  return jest.fn((msg, action) => Promise.resolve(action()))
})

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

describe('List changes', () => {
  const list = require('../src/list')


  test('List changes', async () => {

    await list('/test/testpack', false, false, false)

    expect.assertions(4)
    expect(console.log.mock.calls[0][0]).not.toMatch(/folder/)
    expect(console.log.mock.calls[0][0]).toMatch(/testfile1/)
    expect(console.log.mock.calls[0][0]).toMatch(/testfile2/)
    expect(console.log.mock.calls[0][0]).toMatch(/testfile3/)
  })


  test('List changes (verbose)', async () => {

    const currentDate = new Date(Date.UTC(2017,0,1)).toLocaleString()
    await list('/test/testpack', true, false, false)

    expect.assertions(3)
    expect(console.log.mock.calls[0][0]).toMatch(/folder/)
    expect(console.log.mock.calls[0][0]).toMatch(/testfile/)
    expect(console.log.mock.calls[0][0]).toMatch(currentDate)
  })


  test('List changes (full path)', async () => {

    await list('/test/testpack', false, true, false)

    expect.assertions(3)
    expect(console.log.mock.calls[0][0]).toMatch(/testfile1/)
    expect(console.log.mock.calls[0][0]).toMatch(/folder1\/testfile2/)
    expect(console.log.mock.calls[0][0]).toMatch(/folder1\/folder2\/folder3\/testfile3/)
  })


  test('List changes (report to file)', async () => {

    await list('/test/testpack', false, false, true)
    const fileContent = fs.readFileSync('/test/testpack/report.txt', 'utf8')

    expect.assertions(3)
    expect(fileContent).toMatch(/testfile1/)
    expect(fileContent).toMatch(/testfile2/)
    expect(fileContent).toMatch(/testfile3/)
  })
})
