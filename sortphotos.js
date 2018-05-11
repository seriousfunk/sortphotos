const fs 		= require('fs');
const path 		= require('path');
const os 		= require("os");
const ExifImage = require('exif').ExifImage;

const logFile = fs.createWriteStream('./sortphotos.log');

if (process.argv.length <= 2) {

    console.log(os.EOL + "\x1b[1m \x1b[31m Usage: \x1b[0m node " + path.basename(__filename, '.js') + " path/to/directory" + os.EOL);
    process.exit(1);
}

var dirPath = process.argv[2];
 
fs.readdir(dirPath, function(err, items) {
    for (let i=0; i<items.length; i++) {
        let file = dirPath + '/' + items[i];
        console.log("Start: " + file);
 
        fs.stat(file, function(err, stats) {

			if ('.jpg' == path.extname(file)) {

				try {
				    new ExifImage({ image : file }, function (error, exifData) {
				        if (error) {
				            console.log('ExifImage Error: ' + file + " " + error.message);
						    // logFile.end();
				    		process.exit(1);
				    	}
				        else {

							// logFile.write("-------------------------------");
							// logFile.write(file);
							// logFile.write(exifData);

				        	console.log(os.EOL + "\x1b[1m \x1b[33m ------------------------------- \x1b[0m")
				        	console.log(os.EOL + "\x1b[1m \x1b[33m " + file + "   \x1b[0m")
				            console.log(exifData); // Do something with your data!
				        }
				    });
				} catch (error) {
				    console.log('Error: ' + error.message);
				    // logFile.end();
				    process.exit(2);
				}

	            console.log(file);
	            console.log(stats["size"]);
			}    

	     });

    }

});

