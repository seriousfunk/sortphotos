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
  .option('-s, --source <source>', 'Source Directory')
  .option('-d, --destination <destination>', 'Destination Directory')
  .option('-r, --recursive', 'recurse subdirectories')
  .option('-f --folder <format>', 'Folder Format', /^(YYYY_MM|YYYY_MM_DD|YYYY\/MM|YYYY\/MM-Month)$/i, 'YYYY\/MM-Month')
  .on('--help', function() {
	console.log()
    console.log("  " + chalk.bgYellow(" Examples: "));
    console.log()
    console.log("   $ node " + path.basename(process.argv[1], '.js') + " -s c:\\camera uploads -d c:\\My Photos -f YYYY\/YYYY_MM")
    console.log()
  });
  
program.parse(process.argv);

if (undefined == program.source || undefined == program.destination) {
	console.log()
	console.log(chalk` {bgRed  Error: } {red source and destination folder required.}`)
	program.help()
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
				            console.log(chalk` {bgRed  ExifImage Error:} ${file} ${error.message}`)
				    		process.exit(1)
				    	}
				        else {
				        	console.log(chalk`${os.EOL}{bgBlue  ${file} } `)
				            console.log(exifData.exif.CreateDate); // Do something with your data!
				            // split create date on colons or spaces
				            let cd = exifData.exif.CreateDate.split(/[:| ]/,3)
				            // console.log(cd)
				            console.log(`Year: ${cd[0]}`)
				            console.log(`Month: ${cd[1]}`)
							console.log(`Day: ${cd[2]}`)
				        }
				    });
				} catch (error) {
				    console.log('Error: ' + error.message);
				    process.exit(2);
				}

	            // console.log(file);
	            // console.log(stats["size"]);
			}
			else {
				// if not a file with exif data just move the file based on file date
				console.log(chalk`${os.EOL}{bgMagenta  ${file} } {magenta is not a .jpg }`)
				// console.log('MTIME: ' + stats.mtime)
				let fileDate = new Date(stats.mtime);
				let fileYear = fileDate.getFullYear();
				let fileMonth = fileDate.getMonth()+1;
				let fileDay = fileDate.getDate();
				console.log(`Year: ${fileYear}`)
				console.log(`Month: ${fileMonth}`)
				console.log(`Day: ${fileDay}`)
			}    

	     });

    }

});

