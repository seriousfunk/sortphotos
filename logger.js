'use strict'

const fs        = require('fs')
const path      = require('path')
const snl       = require('simple-node-logger')
const mkdirp    = require('mkdirp')
const chalk     = require('chalk')
const stripAnsi = require('strip-ansi')

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

const AbstractAppender = snl.AbstractAppender;

const StripAnsiAppender = function(logPath) {
  'use strict';
  var appender = this;
  
    var opts = {
        typeName: 'StripAnsiAppender',
        logFile: logPath
    };
    
    AbstractAppender.extend( this, opts );
    
    // format and write all entry/statements
    this.write = function(entry) {
      var fields = appender.formatEntry( entry );
      fields[2] = stripAnsi(fields[2])
      // console.log(`${stripAnsi(fields[2])} -- with ansi stripped.\n`)
    };
};

log.addAppender(new StripAnsiAppender())

// ***********************************************************************
// How would I override FileAppender so that it strips ansi characters?
// ***********************************************************************

/* log.appenders['FileAppender'].formatter = function(entry) {
  const fields = appender.formatEntry( entry );
  fields[2] = stripAnsi(fields[2])
  // add new line (for linux and windows)
  fields.push( newline );
  return fields.join( appender.separator );
}; */

// console.log(log.getAppenders())

log.info(chalk`this is my {green first} log msg.`)
log.info(chalk`this is my {red second} log msg.`)
log.error(chalk`this is my {magenta third} log msg.`)


