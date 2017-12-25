const path = require('path')
jest.mock('fs')

const mockConfigPath = path.join(__dirname, '../config.json')
const mockConfig = {
  changesFile: {
    filename: 'changes.json'
  }
}

const mockFileSystem = {
  '/testpack/changes.json': '{}',
  mockConfigPath: mockConfig
}

const fs = require('fs')
const vol = fs.vol

fs.vol.fromJSON(mockFileSystem)

describe('Changes file management', () => {
  const ch = require('../src/utils/change-manager')

console.log(__dirname)

  test('Get changes file', () => {
    expect(ch.getChangesFile('/testpack')).toBe('/testpack/')
  })

//  test('File system test', async () => {
//    expect.assertions(1)
//
//    await ch.create(path.join('/home/g-szabo/test'), 'noname')
//    expect(fs.existsSync('/home/g-szabo/test')).toBe(true)
//  })

})
