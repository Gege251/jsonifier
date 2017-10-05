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

function differences (la, lb) {
  let lcslist = lcs(la, lb, la.length - 1, lb.length - 1)
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

  let rema = la.length - (lcslist.length + fixa)
  let remb = lb.length - (lcslist.length + fixb)

  if (rema > 0) {
    results.del.push({index: lcslist.length + fixa, length: rema})
  }
  if (remb > 0) {
    results.ins.push({index: lcslist.length + fixb, length: remb})
  } 

  return results
}

String.prototype.hashCode = function(){
    let hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


function diff (fileA, fileB) {
  let dataA = fs.open(fileA, 'r')
    .then(fd => fs.readFile(fd, 'utf8'))

  let dataB = fs.open(fileB, 'r')
    .then(fd => fs.readFile(fd, 'utf8'))

  Promise.all([dataA, dataB])
    .then(data => {

      let hashed = data.map(data =>
        data.split('\n')
            .filter(line => line) // filter empty lines
            .map(data => data.hashCode())
          )
          // let lcsAB = lcs(hashed[0], hashed[1], hashed[0].length, hashed[1].length)
          // console.log(lcsAB)
          console.log(differences(hashed[0], hashed[1]))
      })
    .catch(err => console.log(err))
}

let la = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
let lb = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 18]
// let lb = [0, 11, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13, 16]

let memo = new Map()

// let lcsAB = lcs(la, lb, la.length - 1, lb.length - 1)
// console.log(lcsAB)
// console.log(differences(la, lb))
diff('./test', './test2')
