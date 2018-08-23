'use strict'

const fs 		= require('fs')
const path 		= require('path')
const os 		= require("os")
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

if (program.dryRun) {
  console.log(chalk`${os.EOL}{bgRed  Dry Run: } {red Not sorting and moving photos. Simply displaying and logging what we would do if this was not a dry-run.}`)
  console.log(chalk`${os.EOL}{bold Destination folder:}  ${path.join(program.destination, program.folder)}`)
}

// console.log("program.source = " + program.source)
// return

// create the directory if it doesn't exist
async function setDirectory(fileDate) {
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
  
  // Check if directory exists
  // fs.stat(filePath)

  console.log(`folder = ${path.join(program.destination, dateFolder)}`)

}


function moveFile() {

}

// TODO: msg about creating or writing to log file in log directory
console.log(`${os.EOL}Logging sortphotos activity. Run ${new Date}.`)

fs.readdir(program.source, function(err, items) {
	if (err) {
		return console.error(err);
		process.exit(1);
	 }
	for (let i=0; i<items.length; i++) {
		let file = program.source + '/' + items[i];
 
		fs.stat(file, function(err, stats) {

			if ('.jpg' == path.extname(file)) {

				try {
					new ExifImage({ image : file }, function (error, exifData) {
						if (error) {
							console.log(chalk`{bgRed  ExifImage Error:} ${file} ${error.message}`)
							process.exit(1)
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
							// check for directory and move file
							setDirectory(fileDate)
								.then(moveFile(file))
								.catch(console.error)
						}
					});
				} catch (error) {
					console.log(chalk`{bgRed  Error: } ${error.message}`)
					process.exit(2)
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
				// check for directory and move file
				setDirectory(fileDate)
					.then(moveFile(file))
					.catch(console.error)
			}    

		 });

	}

});

