
// Mocks

jest.mock('fs')
jest.mock('../src/utils/areyousure', () => {
  return jest.fn((msg, action) => Promise.resolve(action()))
})

const path       = require('path')
const fs         = require('fs-extra')

// Setup

beforeEach(() => {
  const mockConfigPath = path.join(__dirname, '../config.json')
  
  const mockConfig     = JSON.stringify({
    changesFile: {
      filename: 'changes.json',
      filetype: 'json'
    },
    deployconfFile: {
      filename: '.deployconf',
      filetype: 'json'
    }
  })

  const mockDeployConf = JSON.stringify({
    name            : 'Testdeploy',
    source          : '/source',
    originalVersion : '/original',
    editedVersion   : '/edited',
    archive         : 'archive',
    otherDirs       : []
  })

  const currentDate = new Date(Date.UTC(2017,0,1)).toLocaleString()
  const newDate     = new Date(Date.UTC(2017,0,2)).toLocaleString()

  const mockChFile     = JSON.stringify({
    name    : 'noname',
    title   : '',
    changes : [
        {
          filename : 'testfile1',
          path     : '/',
          added    : currentDate,
          changed  : currentDate
        },
        {
          filename : 'testfile2',
          path     : '/folder1',
          added    : currentDate,
          changed  : newDate
        },
        {
          filename : 'testfile3',
          path     : '/folder1/folder2/folder3',
          added    : currentDate,
          changed  : currentDate
        }
    ],
    lock    : false
  })

  const mockFileSystem = {
    '/source/testfile1'                                         : 'This is file 1',
    '/source/folder1/testfile2'                                 : 'This is file 2',
    '/source/folder1/folder2/folder3/testfile3'                 : 'This is file 3',
    [mockConfigPath]                                            : mockConfig,
    '/test/.deployconf'                                         : mockDeployConf,
    '/test/testpack/changes.json'                               : mockChFile,
    '/test/testpack/original/testfile1'                         : 'This is file 1',
    '/test/testpack/original/folder1/testfile2'                 : 'This is file 2',
    '/test/testpack/original/folder1/folder2/folder3/testfile3' : 'This is file 3',
    '/test/testpack/edited/testfile1'                           : 'This is file 1',
    '/test/testpack/edited/folder1/testfile2'                   : 'This is file 2 edited',
    '/test/testpack/edited/folder1/folder2/folder3/testfile3'   : 'This is file 3',
  }

  fs.vol.fromJSON(mockFileSystem)

  console.log = jest.fn()
})

// Teardown

afterEach(() => {
  fs.vol.reset()
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
