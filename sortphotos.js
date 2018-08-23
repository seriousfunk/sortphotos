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
  .option('-f --folder <format>', 'Folder Format', /^(YYYY_MM|YYYY_MM_DD|YYYY\/MM|YYYY\/MM-Month)$/i, 'YYYY\/MM-Month')
  .option('-x, --dry-run', 'Write to screen and log what would happen but do not do anything.')
  .on('--help', function() {
	console.log()
    console.log("  " + chalk.bgYellow(" Examples: "));
    console.log()
    console.log(`   $ node ${path.basename(process.argv[1], '.js')} -s "c:\\camera uploads" -d "c:\\My Photos" -f YYYY\/YYYY_MM`)
    console.log()
  });
  
program.parse(process.argv);

// if (undefined == program.source || undefined == program.destination) {
if (!program.source || !program.destination) {	
	console.log(chalk`${os.EOL}{bgRed  Error: } {red source and destination folder required.}`)
	program.help()
}

if (program.dryRun) {
	console.log(chalk`${os.EOL}{bgRed  Dry Run: } {red Not sorting, moving photos. Simply displaying and logging what we would do if this was not a dry-run.}`)
}

// console.log("program.source = " + program.source)
// return

// create the directory if it doesn't exist
function setDirectory (year, month) {

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
		// console.log("Start: " + file);
 
        fs.stat(file, function(err, stats) {

			if ('.jpg' == path.extname(file)) {

				try {
				    new ExifImage({ image : file }, function (error, exifData) {
				        if (error) {
				            console.log(chalk`{bgRed  ExifImage Error:} ${file} ${error.message}`)
				    		process.exit(1)
				    	}
				        else {
				            let cd = exifData.exif.CreateDate.split(/[:| ]/,3)
							if (program.dryRun) {
								console.log(chalk`${os.EOL}{bgBlue  ${file} } `)
								console.log(exifData.exif.CreateDate);
								console.log(`Year: ${cd[0]}`)
								console.log(`Month: ${cd[1]}`)
								console.log(`Day: ${cd[2]}`)
							}
							// check for directory and move file
				        }
				    });
				} catch (error) {
				    console.log(chalk`{bgRed  Error: } ${error.message}`);
				    process.exit(2);
				}

	            // console.log(file);
	            // console.log(stats["size"]);
			}
			else {
				// MTIME
				let fileDate = new Date(stats.mtime);
				let fileYear = fileDate.getFullYear();
				let fileMonth = fileDate.getMonth()+1;
				let fileDay = fileDate.getDate();
				if (program.dryRun) {
					console.log(chalk`${os.EOL}{bgMagenta  ${file} } {magenta is not a .jpg }`)
					console.log(`Year: ${fileYear}`)
					console.log(`Month: ${fileMonth}`)
					console.log(`Day: ${fileDay}`)
				}
				// if not a file with exif data just move the file based on file date
				
				// check for directory and move file
			}    

	     });

    }

});

