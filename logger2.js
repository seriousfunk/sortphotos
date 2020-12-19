'use strict'

const fs        = require('fs')
const path      = require('path')
const snl       = require('simple-node-logger')
const mkdirp    = require('mkdirp')
const chalk     = require('chalk')
const stripAnsi = require('strip-ansi')
const StripAnsiAppender = require('./StripAnsiFileAppender')

// Log file including path
const logPath = 'logs/stripAnsi.log'

const logDir      = path.dirname(path.normalize(logPath))
const logFile     = path.basename(logPath)

mkdirp(logDir, function (err) {
  if (err) {
    console.log(chalk`${os.EOL}{bgRed  mkdirp Error:} ${logDir} ${err}`)
    process.exit(1)
  }
})

const log = snl.createSimpleLogger()

log.addAppender(new StripAnsiAppender(logPath))

log.info(chalk`this is my {green first} log msg.`)
log.info(chalk`this is my {red second} log msg.`)
log.error(chalk`this is my {magenta third} log msg.`)


