'use strict'

const fs        = require('fs')
const path      = require('path')
const snl       = require('simple-node-logger')
const mkdirp    = require('mkdirp')
const chalk     = require('chalk')
const stripAnsi = require('strip-ansi')


const logFile = 'logs/matt.log'
const logDir  = path.dirname(path.normalize(logFile))


mkdirp(logDir, function (err) {
  if (err) {
    console.log(chalk`${os.EOL}{bgRed  mkdirp Error:} ${logDir} ${err}`)
    process.exit(1)
  }
})

const log = snl.createSimpleLogger(logFile)

const AbstractAppender = snl.AbstractAppender;

const StripAnsiAppender = function() {
  'use strict';
  var appender = this;
  
    var opts = {
        typeName:'StripAnsiAppender'
        
    };
    
    AbstractAppender.extend( this, opts );
    
    // format and write all entry/statements
    this.write = function(entry) {
      var fields = appender.formatEntry( entry );
      fields[2] = stripAnsi(fields[2])
      console.log(`${stripAnsi(fields[2])} -- with ansi stripped.\n`)
      // console.log('\n\nfields:' + fields + '\n\n')
    };
};

log.addAppender(new StripAnsiAppender())
// snl.appenders['FileAppender'].


// console.log(log.getAppenders())

log.info(chalk`this is my {green first} log msg.`)
log.info(chalk`this is my {red second} log msg.`)
log.error(chalk`this is my {magenta third} log msg.`)


