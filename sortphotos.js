const fs 		= require('fs');
const path 		= require('path');
const os 		= require("os");
const ExifImage = require('exif').ExifImage;

if (process.argv.length <= 2) {

    console.log(os.EOL + "\x1b[1m \x1b[31m Usage: \x1b[0m node " + path.basename(__filename, '.js') + " path/to/directory" + os.EOL);
    process.exit(1);
}

var dirPath = process.argv[2];
 
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
				console.log('CTIME: ' + stats.mtime)
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

