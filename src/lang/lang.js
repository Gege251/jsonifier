
class Lang {

  constructor(arg) {
    this.lang     = 'en'
    this.messages = require('./en/messages')
  }

  setLang(arg) {
    const validLangs = [ 'en', 'ja' ]

    if (arg && validLangs.includes(arg)) {
      this.lang     = arg
      this.messages = require('./' + arg + '/messages')
    }
  }

}

module.exports = new Lang()
