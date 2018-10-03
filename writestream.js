const fs      = require('fs');
const path    = require('path')
const mkdirp  = require('mkdirp')
const chalk   = require('chalk')

let logFile = path.normalize('./my/logs/writestream.log')

async function setupLogging (logFile) {
  await mkdirp(logFile, function (err) {
    if (err) {
      console.log(chalk`${os.EOL}{bgRed  mkdirp Error: } {red ${err} }`)
    }
  })
  return new Promise(resolve => {
    resolve(fs.createWriteStream(logFile, {flags: 'w'}))
  })
}

(async () => {
  let writeStream = await setupLogging(logFile)
  writeStream.write('alpha \n');
  writeStream.write('beta\n');
  writeStream.end()
})();

