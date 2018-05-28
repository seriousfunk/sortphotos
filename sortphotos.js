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
  .option('-s, --source', 'Source Directory')
  .option('-d, --destination', 'Destination Directory')
  .option('-r, --recursive', 'recurse subdirectories')
  .option('-f --folder <format>', 'Folder Format', /^(YYYY_MM|YYYY_MM_DD|YYYY\/MM)$/i, 'YYYY_MM')
  .on('--help', function() {
	console.log()
    console.log("  " + chalk.yellow("Examples:"));
    console.log()
    console.log("   $ node " + path.basename(process.argv[1], '.js') + " -s c:\\camera uploads -d c:\\My Photos -f YYYY_MM")
    console.log()
  });  
program.parse(process.argv);

if (undefined == program.source || undefined == program.destination) {
	console.log()
	console.log("Error: " + chalk.red("source and destination folder required."))
	program.help()
}

// create the directory if it doesn't exist
function setDirectory (year, month) {

}

fs.readdir(dirPath, function(err, items) {
	if (err) {
		return console.error(err);
		process.exit(1);
	 }
    for (let i=0; i<items.length; i++) {
        let file = dirPath + '/' + items[i];
        console.log("Start: " + file);
 
        fs.stat(file, function(err, stats) {

			if ('.jpg' == path.extname(file)) {

				try {
				    new ExifImage({ image : file }, function (error, exifData) {
				        if (error) {
				            console.log('ExifImage Error: ' + file + " " + error.message);
				    		process.exit(1);
				    	}
				        else {
				        	console.log(os.EOL + "\x1b[1m\x1b[33m------------------------------- \x1b[0m")
				        	console.log("\x1b[1m\x1b[33m" + file + "   \x1b[0m" + os.EOL)
				            console.log(exifData.exif.CreateDate); // Do something with your data!
				            // split create date on colons or spaces
				            let cd = exifData.exif.CreateDate.split(/[:| ]/,3)
				            console.log(cd)
				            console.log(`Year: ${cd[0]}`)
				            console.log(`Month: ${cd[1]}`)
							console.log(`Day: ${cd[2]}`)
				        }
				    });
				} catch (error) {
				    console.log('Error: ' + error.message);
				    process.exit(2);
				}

	            console.log(file);
	            console.log(stats["size"]);
			}
			else {
				// if not a file with exif data just move the file based on file date
				console.log(`${file} is not a .jpg`)
				console.log('MTIME: ' + stats.mtime)
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

