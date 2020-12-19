const fs      = require('fs');
const path    = require('path')
const mkdirp  = require('mkdirp')
const chalk   = require('chalk')

let logFile = path.normalize('./my/logs/writestream.log')
let logPath = path.normalize(path.dirname(logFile))

console.log(`Log file: ${logFile}`)
console.log(`Log path: ${logPath}`)

mkdirp.sync(logPath, function (err) {
  if (err) {
    console.log(chalk`${os.EOL}{bgRed  mkdirp Error: } {red ${err} }`)
  }
})

let writeStream = fs.createWriteStream(logFile, {flags: 'w'})
writeStream.on('error', function(e){console.log(e)})

writeStream.write('super \n');
writeStream.write('man\n');
writeStream.end()


