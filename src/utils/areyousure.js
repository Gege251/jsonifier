const readline = require('readline')

module.exports = areyousure

function areyousure(message, action) {
		const rl = readline.createInterface({
			input  : process.stdin,
			output : process.stdout
		})

		return new Promise((resolve, reject) =>
			rl.question(message + '\n', answer => {
				rl.close()
				if (['Y', 'y'].includes(answer)) {
					resolve(action())
				} else {
          resolve(false)
        }
			})
		)
}
