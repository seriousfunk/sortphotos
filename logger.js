'use strict'

const fs      = require('fs')
const path    = require('path')
const snl     = require('simple-node-logger')
const moment  = require('moment')
const mkdirp   = require('mkdirp');

// var logFile = './logs/sortphotos-'+moment().format('YYYY-MM-DD-HHmmss')+'.log'
// var logFile = './logs/sortphotos.log'

const logFile = 'logs/wtf/hithere/matt.log'

const logDir = path.dirname(path.normalize(logFile))

console.log('logDir = ' + logDir)

mkdirp(logDir, function (err) {
  if (err) {
    console.log(chalk`${os.EOL}{bgRed  mkdirp Error:} ${directory} ${err}`)
    process.exit(6)
  }
  const log = snl.createSimpleLogger(logFile)
  log.info('this is my first log msg.')
  // const log = require('simple-node-logger').createSimpleLogger('project.log');
})



