var commander = require('commander');
const moment = require("moment")
const chalk = require("chalk")
const path = require("path")

const program = new commander.Command();

program
  .version("1.0.0")
  .description(
    "Move photos from a directory into an organized directory structure by the photos exif date created (if available) or file create date."
  )
  .usage('-s "c:\\camera uploads" -d "c:\\My Photos" -f YYYY\/YYYY_MM')
  .option(
    "-s, --source <source>",
    "Source Directory (Use quotes if directory contains spaces. Do not end in a backslash as it will escape your quote.)"
  )
  .option(
    "-d, --destination <destination>",
    "Destination Directory (Use quotes if directory contains spaces. Do not end in a backslash as it will escape your quote.)"
  )
  .addOption(new commander.Option('-f, --folder <format>',
    'Folder Format')
    .choices(['YYYY_MM', 'YYYY_MM_DD', 'YYYY/MM', 'YYYY/MM-MON', 'YYYY/MM-Month'])
    .default('YYYY/MM-Month'))
  .option(
    "-l --log [log_file]",
    "Log file, including path",
    "<source_directory>/logs/sortphotos-" +
    moment().format("YYYY-MM-DD-HHmmss") +
    ".log"
  )
  .option(
    "-x, --dry-run",
    "Write to screen and log what would happen but do not do anything."
  )
  .option("-o, --older-than [30]", "Only move files older than 30 days.", "30")
// .option("-r, --recursive", "recurse subdirectories")

program.parse(process.argv)

const options = program.opts()

console.log(options)