'use strict'

const fs        = require('fs')
const path      = require('path')
const snl       = require('simple-node-logger')
const moment    = require('moment')
const mkdirp    = require('mkdirp')
const chalk     = require('chalk')
const stripAnsi = require('strip-ansi')

// var logFile = './logs/sortphotos-'+moment().format('YYYY-MM-DD-HHmmss')+'.log'
// var logFile = './logs/sortphotos.log'


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
    
      console.log(stripAnsi(fields[2]))
      
      // console.log('\n\nfields:' + fields + '\n\n')
    };
};


const logFile = 'logs/matt.log'
const logDir  = path.dirname(path.normalize(logFile))


mkdirp(logDir, function (err) {
  if (err) {
    console.log(chalk`${os.EOL}{bgRed  mkdirp Error:} ${logDir} ${err}`)
    process.exit(6)
  }
})

const log = snl.createSimpleLogger(logFile)

log.addAppender(new StripAnsiAppender)

// console.log(log.getAppenders())

log.info(chalk`this is my {green first} log msg.`)
log.info(chalk`this is my {red second} log msg.`)
log.error(chalk`this is my {magenta third} log msg.`)



/* 
const log2 = new require('simple-node-logger').createSimpleLogger();
log2.info = function() {
  var args = Array.prototype.slice.call( arguments ),
      entry = log2.log('info', args);
  
      log.info( stripAnsi(entry) + '\n' );
};

log2.info(chalk`here is a {red word} with Ansi stripped.`) */


