const fs 	= require('fs');
const path 	= require('path');
const os 	= require("os");
const exif 	= require('exif');
 
if (process.argv.length <= 2) {

    console.log(os.EOL + "\x1b[1m \x1b[31m Usage: \x1b[0m node " + path.basename(__filename, '.js') + " path/to/directory" + os.EOL);
    process.exit(-1);
}
 
var dirPath = process.argv[2];
 
fs.readdir(dirPath, function(err, items) {
    for (var i=0; i<items.length; i++) {
        var file = dirPath + '/' + items[i];
        console.log("Start: " + file);
 
        fs.stat(file, function(err, stats) {
            console.log(file);
            console.log(stats["size"]);
        });
    }
});