'use strict'

const fs 		    = require('fs')
const path 		  = require('path')
const os 		    = require("os")
const mv        = require('mv');
const mkdirp    = require('async-mkdirp');
const program   = require('commander')
const chalk     = require('chalk')
const moment    = require('moment')
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
else {
  getFiles()
}

if (program.dryRun) {
  console.log(chalk`${os.EOL}{bgRed  Dry Run: } {red Not sorting and moving photos. Simply displaying and logging what we would do if this was not a dry-run.}`)
  console.log(chalk`${os.EOL}{bold Destination folder structure: }  ${path.join(program.destination, program.folder)}`)
}

// create the directory if it doesn't exist
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

    // Create directory if it does not already exists
    let stats = fs.stat(directory, function (err, stats) {
      if (err && err.code === 'ENOENT') {
        (async () => {
          await mkdirp(directory);
            resolve(path.normalize(directory))
        })();
      }
      else {
        // directory already exists
        resolve(path.normalize(directory))
      }
    })

/*         console.log('make dir')
        await mkdirp(directory, function (err) {
          if (err) {
            console.log(chalk`${os.EOL}{bgRed  mkdirp Error: } ${directory} ${err}`)
            process.exit(6)
          }
          else {
            console.log('** Creating new destination folder')
            if (program.dryRun) {
              console.log(chalk`${os.EOL}{green  Creating new destination folder } ${directory}`)  
            }
          }
        })
      }
      else {
        console.log('** directory already exists')  
        if (program.dryRun) {
          console.log('directory already exists :)')
        }
      }
    })

    // Return directory where the photo should be placed
    resolve(path.normalize(directory))
 */
  }) // Promise
}

async function moveFile(directory, file) {
  let newLocation = path.join(directory, path.basename(file));
  if (program.dryRun) {
    console.log(chalk`${os.EOL}${file} will be moved to ${newLocation}.`)
  }
  else {
    await mv(file, newLocation, function(err) {
      console.log(chalk`{bgRed  mv Error: } ${err}`)
      process.exit(7);
    });
  }
}

// TODO: msg about creating or writing to log file in log directory
if (program.dryRun) {
  console.log(`${os.EOL}Logging sortphotos activity. Run ${new Date}.`)
}

function getExifData(file) {
  return new Promise(resolve => {

    try {

      new ExifImage({ image : file }, function (error, exifData) {

        if (error) {
          console.log(chalk`{bgRed  ExifImage Error: } ${file} ${error.message}`)
          process.exit(3)
        }

        resolve(exifData)
      })

    } catch (error) {
      console.log(chalk`{bgRed  ExifImage Error: } ${error.message}`)
      process.exit(4)
    }

  })
}

function getFiles() {
  fs.readdir(program.source, function(err, items) {
    if (err) {
      console.log(chalk`{bgRed  fs.stat Error: } ${err}`)
      process.exit(1);
     }

     for (let i=0; i<items.length; i++) {

      // let file2 = path.normalize(program.source + '/' + items[i])
      let file = path.join(program.source, items[i])
   
      fs.stat(file, async function(err, stats) {
  
        if (err) {
          console.log(chalk`{bgRed  fs.stat Error: } ${file} ${err}`)
          process.exit(2)
        }
  
 if ('.jpg' == path.extname(file)) {

          let exifData = await getExifData(file)

          // console.log(exifData)
          let fileDate = exifData.exif.CreateDate.split(/[:| ]/,3)
          let logFileDate = fileDate[1]
          fileDate[1] = fileDate[1]-1 // decrementing so log displays the correct month. monthsLong and monthsShort are ZERO based arrays
          fileDate[1] = fileDate[1].toString()
          if (program.dryRun) {
            console.log(chalk`${os.EOL}{bgBlue  ${file} } {blue will be moved according to Exif date when the photo was taken.}`)
            console.log(`Year: ${fileDate[0]}`)
            console.log(`Month: ${logFileDate}`)
            console.log(`Day: ${fileDate[2]}`)
          }
          // Get path to directory we may need to create if it does not exist
          setDirectory(fileDate).then((directory)=>moveFile(directory, file));
          
        }
        else {
          // MTIME
          let fileMtime= new Date(stats.mtime)
          let fileDate = []
          fileDate[0] = fileMtime.getFullYear().toString()
          let logFileDate = fileMtime.getMonth()+1 // incrementing so log displays the correct month. monthsLong and monthsShort are ZERO based arrays
          fileDate[1] = fileMtime.getMonth().toString()
          fileDate[2] = fileMtime.getDate().toString()
          if (program.dryRun) {
            console.log(chalk`${os.EOL}{bgMagenta  ${file} } {magenta is not a .jpg but will be moved according to file create date. }`)
            console.log(`Year: ${fileDate[0]}`)
            console.log(`Month: ${logFileDate}`)
            console.log(`Day: ${fileDate[2]}`)
          }
            // Get path to directory we may need to create if it does not exist
            setDirectory(fileDate).then((directory)=>moveFile(directory, file));
          }    

      });       
  
    }
  
  });
}

