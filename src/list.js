const fs    = require('fs-extra')
const path  = require('path')
const chalk = require('chalk')
const ch    = require('./utils/change-manager')
const msg   = require('./lang/lang.js').messages

const comparePath = function(f1, f2, fullPath) {
	if (fullPath) {
		return path.join(f1.path, f1.filename).localeCompare(path.join(f2.path, f2.filename))
	} else {
		return f1.filename.localeCompare(f2.filename)
	}
}

module.exports = list

async function list(wdir, verbose, fullPath, report) {

  return new Promise(async (resolveApp) => {

    if (! await ch.exists(wdir)) {
      console.log(msg.ERR_NO_CHANGESFILE)
      resolveApp()
      return
    }

    try {
      const chConf = await ch.read(wdir)
      const files  = chConf.changes
      let output   = []

      if (report) {
        chalk.enabled = false
      }

      files.sort((f1, f2) => comparePath(f1, f2, fullPath))
           .forEach(file => {
              let filePath = fullPath ? path.join(file.path, file.filename) : file.filename
              if (verbose) {
                output.push(chalk.green(filePath))
                if (!fullPath) {
                  output.push('\t' + file.path)
                }
                output.push('\t' + file.added)
                output.push('\t' + file.changed)

              } else {
                output.push(chalk.green(filePath))
              }
            })

      if (report) {
        try {
        await fs.writeFile(path.join(wdir, 'report.txt'), output.join('\r\n'))
          console.log(msg.MSG_REPORT_CREATED)
        } catch (e) {
          console.log(msg.ERR_FILE_RW)
        }
        resolveApp()
        return

      } else {
        console.log(output.join('\r\n'))
      }
    } catch(e) { 
      console.log(e)
    }
    resolveApp()
    return
  })
}
