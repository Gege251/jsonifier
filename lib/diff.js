const crypto = require('crypto')
const fs = require('fs-extra')

function memoize (memo, f, args) {
  if (!memo.has(f)) {
    memo.set(f, new Map())
  }
  let memfunc = memo.get(f)

  let retval = memfunc.get(JSON.stringify(args))
  if (!retval) {
    retval = f(...args)
    memfunc.set(JSON.stringify(args), retval)
  }
  return retval
}

function lcs (a, b, ai, bi) {
  if (ai < 0 || bi < 0) {
    return []
  }

  if (a[ai] === b[bi]) {
    return memoize(memo, lcs, [a, b, ai - 1, bi - 1]).concat([[ai, bi]])
  } else {
    return longest(
      memoize(memo, lcs, [a, b, ai - 1, bi]),
      memoize(memo, lcs, [a, b, ai, bi - 1]))
  }
}

function longest (a, b) {
  return a.length < b.length ? b : a
}

function differences (lcslist) {
  let results = {
    del: [],
    ins: []
  }
  let fixa = 0
  let fixb = 0

  for (let i = 0; i < lcslist.length; i++) {
    if (lcslist[i][0] !== i + fixa) {
      let length = lcslist[i][0] - fixa - i
      results.del.push({index: i + fixa, length})
      fixa = lcslist[i][0] - i
    }
    if (lcslist[i][1] !== i + fixb) {
      let length = lcslist[i][1] - fixb - i
      results.ins.push({index: i + fixb, length})
      fixb = lcslist[i][1] - i
    }
  }
  return results
}

function makeHashes (fileA, fileB) {
  let dataA = fs.open(fileA, 'r')
    .then(fd => fs.readFile(fd, 'utf8'))

  let dataB = fs.open(fileA, 'r')
    .then(fd => fs.readFile(fd, 'utf8'))

  Promise.all([dataA, dataB])
    .then(data => {

      let d1 = data[0].split('\n').filter(line => line)
      let d2 = data[1].split('\n').filter(line => line)
      d1.forEach(d => {
        const hash = crypto.createHash('md5')
        hash.on('readable', _ => {
          let hashed = hash.read()
          if (hashed) {
            console.log(hashed.toString('hex'))
          }
        })

        hash.write(d)
        hash.end()
      })
    })
    .catch(err => console.log(err))
}

let la = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 17]
let lb = [0, 11, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13, 16]

let memo = new Map()

let lcsAB = lcs(la, lb, la.length - 1, lb.length - 1)
// console.log(lcsAB)
// console.log(differences(lcsAB))
makeHashes('./test')
