'use strict'

const fs 		    = require('fs')
const path 		  = require('path')
const os 		    = require("os")
const mkdirp    = require('mkdirp');
const moveFile  = require('move-file');
const moment    = require('moment');
const program   = require('commander')
const snl       = require('simple-node-logger')
const chalk     = require('chalk')
const ExifImage = require('exif').ExifImage

program
  .version('1.0.0')
  .description('Move photos from a directory into an organized directory structure by the photos exif date created (if available) or file create date.')
  .option('-s, --source <source>', 'Source Directory (use quotes if directory contains spaces)')
  .option('-d, --destination <destination>', 'Destination Directory (use quotes if directory contains spaces)')
  .option('-r, --recursive', 'recurse subdirectories')
  .option('-f --folder <format>', 'Folder Format', /^(YYYY_MM|YYYY_MM_DD|YYYY\/MM||YYYY\/MM-MON|YYYY\/MM-Month)$/i, 'YYYY\/MM-Month')
  .option('-l --log [log_file]', 'Log file, including path', './logs/sortphotos-'+ moment().format('YYYY-MM-DD-HHmmss') +'.log' )
  .option('-x, --dry-run', 'Write to screen and log what would happen but do not do anything.')
  .on('--help', function() {
	console.log()
	console.log("  " + chalk.bgYellow(" Examples: "));
	console.log()
	console.log(`   $ node ${path.basename(process.argv[1], '.js')} -s "c:\\camera uploads" -d "c:\\My Photos" -f YYYY\/YYYY_MM`)
	console.log()
  });
  
program.parse(process.argv);

if (!program.source || !program.destination) {	
	console.log(chalk`${os.EOL}{bgRed  Error: } {red source and destination folder required.}`)
	program.help()
}

let log = null

if (program.dryRun || program.log) {
  let logPath = path.normalize(path.dirname(program.log))
  mkdirp.sync(logPath, function (err) {
    if (err) console.log(chalk`${os.EOL}{bgRed  mkdirp Error: } {red ${err} }`)
  })
  log = snl.createSimpleLogger(path.normalize(program.log))
  log.info(`Dry Run: Not sorting and moving photos. Simply displaying and logging what we would do if this was not a dry-run`)
  log.info(`Destination folder structure: ${path.join(program.destination, program.folder)}`)
}

fs.readdir( program.source, function( err, files ) {

  if( err ) {
      log.error(`Could not read list of files. ${err}`);
      process.exit(1);
  } 

  files.forEach( async function( file, index ) {
    let filePath = path.join(program.source, file)  
    let fileDate = await getFileDate(filePath)
    let toDir    = await setDirectory(fileDate)
    let newPath  = path.join(toDir, file)
    if (program.dryRun) {
      log.info(`Would move ${filePath} to ${newPath}`)
    }
    else {
      await moveFile(filePath, newPath)
      log.info(`Moved ${filePath} to ${newPath}`)
    }
  })
});

function getFileDate(file) {
  return new Promise(resolve => {
    let fileDate = []
    if ('.jpg' == path.extname(file)) {
      try {
        new ExifImage({ image : file }, function (error, exifData) {
          if (error) {
            console.log(chalk`{bgRed  ExifImage Error: } ${file} ${error.message}`)
            process.exit(1)
          }
          fileDate = exifData.exif.CreateDate.split(/[:| ]/,3)
          let logFileDate = fileDate[1]
          fileDate[1] = fileDate[1]-1 // decrementing so log displays the correct month. monthsLong and monthsShort are ZERO based arrays
          fileDate[1] = fileDate[1].toString()
        })
      }
      catch (error) {
        console.log(chalk`{bgRed  ExifImage Error: } ${error.message}`)
        process.exit(1)
      }
    }

    // if we don't have a file date bc it is not a jpg or the jpg is missing exif data
    if ( 0 === fileDate.length )  {
        let stats = fs.statSync(file)
        let fileMtime= new Date(stats.mtime)
        fileDate[0] = fileMtime.getFullYear().toString()
        let logFileDate = fileMtime.getMonth()+1 // incrementing so log displays the correct month. monthsLong and monthsShort are ZERO based arrays
        fileDate[1] = fileMtime.getMonth().toString()
        fileDate[2] = fileMtime.getDate().toString()
    }       
    resolve(fileDate)
  })
}

function setDirectory(fileDate) {
  return new Promise(resolve => {
    let dateFolder = null
    const monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthsShort = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    let monthNumber = (parseInt(fileDate[1])+1).toString() // to account for ZERO based monthsLong and monthsShort arrays
    
    // Compose directory based on folder set or default
    switch (program.folder) {
      case 'YYYY_MM':
        dateFolder = `${fileDate[0]}_${monthNumber.padStart(2, '0')}`
        break
      case 'YYYY_MM_DD':
        dateFolder = `${fileDate[0]}_${monthNumber.padStart(2, '0')}_${fileDate[2].padStart(2, '0')}`
        break
      case 'YYYY/MM':
        dateFolder = path.join(fileDate[0],monthNumber.padStart(2, '0'))
        break
      case 'YYYY/MM-MON':
      dateFolder = `${path.join(fileDate[0],monthNumber.padStart(2, '0'))}-${monthsShort[fileDate[1]]}`
        break      
      case 'YYYY/MM-Month':
        dateFolder = `${path.join(fileDate[0],monthNumber.padStart(2, '0'))}-${monthsLong[fileDate[1]]}`
      default:
        dateFolder = `${path.join(fileDate[0],monthNumber.padStart(2, '0'))}-${monthsLong[fileDate[1]]}`
    }

    // Combine destination folder with date structure they chose
    let directory = path.join(program.destination, dateFolder)
    resolve(path.normalize(directory))
  });
}


