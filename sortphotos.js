'use strict'

const fs 		    = require('fs')
const path 		  = require('path')
const os 		    = require("os")
const mkdirp    = require('mkdirp');
const program   = require('commander')
const chalk     = require('chalk')
const ExifImage = require('exif').ExifImage

program
  .version('1.0.0')
  .description('Move photos from a directory into an organized directory structure by the photos exif date created (if available) or file create date.')
  .option('-s, --source <source>', 'Source Directory (use quotes if directory contains spaces)')
  .option('-d, --destination <destination>', 'Destination Directory (use quotes if directory contains spaces)')
  .option('-r, --recursive', 'recurse subdirectories')
  .option('-f --folder <format>', 'Folder Format', /^(YYYY_MM|YYYY_MM_DD|YYYY\/MM||YYYY\/MM-MON|YYYY\/MM-Month)$/i, 'YYYY\/MM-Month')
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
else {
  getFiles()
}

if (program.dryRun) {
  console.log(chalk`${os.EOL}{bgRed  Dry Run: } {red Not sorting and moving photos. Simply displaying and logging what we would do if this was not a dry-run.}`)
  console.log(chalk`${os.EOL}{bold Destination folder structure:}  ${path.join(program.destination, program.folder)}`)
}

// create the directory if it doesn't existh
function setDirectory(fileDate) {
  let dateFolder = null
  const monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthsShort = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  // Compose directory based on folder set or default
  switch (program.folder) {
    case 'YYYY_MM':
      dateFolder = `${fileDate[0]}_${fileDate[1].padStart(2, '0')}`
      break
    case 'YYYY_MM_DD':
      dateFolder = `${fileDate[0]}_${fileDate[1].padStart(2, '0')}_${fileDate[2].padStart(2, '0')}`
      break
    case 'YYYY/MM':
      dateFolder = path.join(fileDate[0],fileDate[1].padStart(2, '0'))
      break
    case 'YYYY/MM-MON':
    dateFolder = `${path.join(fileDate[0],fileDate[1].padStart(2, '0'))}-${monthsShort[fileDate[1]]}`
      break      
    case 'YYYY/MM-Month':
      dateFolder = `${path.join(fileDate[0],fileDate[1].padStart(2, '0'))}-${monthsLong[fileDate[1]]}`
    default:
      dateFolder = `${path.join(fileDate[0],fileDate[1].padStart(2, '0'))}-${monthsLong[fileDate[1]]}`
  }

  // Combine destination folder with date structure they chose
  let directory = path.join(program.destination, dateFolder)

  console.log('directory: ' + directory)

  // Create directory if it does not already exists
  let stats = fs.stat(directory, function (err, stat) {
    if (err) {
        console.log('wtf: ' + err);
    }
  })

  if ( stats.isDirectory() ) {
    console.log('dir exists')
  }
  else {
    console.log('dir does NOT exists')
  }
  
  if ( stats.isDirectory() ) {
    mkdirp(directory, function (err) {
      if (err) {
        console.log(chalk`${os.EOL}{bgRed  mkdirp Error:} ${directory} ${err}`)
        process.exit(6)
      }
      else {
        if (program.dryRun) {
          console.log(chalk`${os.EOL}{green Creating new destination folder} ${directory}`)
        }
      } 
    });
  }
  else {
    if (program.dryRun) {
      console.log(chalk`${os.EOL}{blue Destination folder already exists} ${directory}.`)
    }
  }
 
  // Return directory where the photo should be placed
  return directory

}

function moveFile(directory, file) {
  if (program.dryRun) {
    console.log(chalk`${os.EOL} ${file} will be placed in ${directory}.`)
  }
}

// TODO: msg about creating or writing to log file in log directory
if (program.dryRun) {
  console.log(`${os.EOL}Logging sortphotos activity. Run ${new Date}.`)
}

function getFiles() {
  fs.readdir(program.source, function(err, items) {
    if (err) {
      console.log(chalk`{bgRed  fs.stat Error:} ${err}`)
      process.exit(1);
     }
    for (let i=0; i<items.length; i++) {
      let file = program.source + '/' + items[i];
   
      fs.stat(file, function(err, stats) {
  
        if (err) {
          console.log(chalk`{bgRed  fs.stat Error:} ${file} ${err}`)
          process.exit(2)
        }
  
        if ('.jpg' == path.extname(file)) {
  
          try {
            new ExifImage({ image : file }, function (error, exifData) {
              if (error) {
                console.log(chalk`{bgRed  ExifImage Error:} ${file} ${error.message}`)
                process.exit(3)
              }
              else {
                let fileDate = exifData.exif.CreateDate.split(/[:| ]/,3)
                // subtract 1 from month to match Month array that starts at 0 for January
                fileDate[1] = fileDate[1]-1
                fileDate[1] = fileDate[1].toString()
                if (program.dryRun) {
                  console.log(chalk`${os.EOL}{bgBlue  ${file} } {blue will be moved according to Exif date when the photo was taken.}`)
                  console.log(`Year: ${fileDate[0]}`)
                  console.log(`Month: ${fileDate[1]}`)
                  console.log(`Day: ${fileDate[2]}`)
                }
                
                // Get path to directory we may need to create if it does not exist
                let directory = setDirectory(fileDate)
                moveFile(directory, file)
  
              }
            });
          } catch (error) {
            console.log(chalk`{bgRed  Error: } ${error.message}`)
            process.exit(4)
          }
  
          // console.log(file);
          // console.log(stats["size"]);
        }
        else {
          // MTIME
          let fileMtime= new Date(stats.mtime)
          let fileDate = []
          fileDate[0] = fileMtime.getFullYear().toString()
          fileDate[1] = fileMtime.getMonth().toString()
          fileDate[2] = fileMtime.getDate().toString()
          if (program.dryRun) {
            console.log(chalk`${os.EOL}{bgMagenta  ${file} } {magenta is not a .jpg but will be moved according to file create date. }`)
            console.log(`Year: ${fileDate[0]}`)
            console.log(`Month: ${fileDate[1]}`)
            console.log(`Day: ${fileDate[2]}`)
          }
            // Get path to directory we may need to create if it does not exist
            let directory = setDirectory(fileDate)
            moveFile(directory, file)
        }    
  
       });
  
    }
  
  });
}

