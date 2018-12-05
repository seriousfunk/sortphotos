"use strict"

const fs = require("fs")
const path = require("path")
const os = require("os")
const mkdirp = require("mkdirp")
const moveFile = require("move-file")
const moment = require("moment")
const program = require("commander")
const snl = require("simple-node-logger")
const recursive = require("recursive-readdir")
const chalk = require("chalk")
const ExifImage = require("exif").ExifImage

let log = null
let filesMoved = 0
let fileErrors = 0

program
  .version("1.0.0")
  .description(
    "Move photos from a directory into an organized directory structure by the photos exif date created (if available) or file create date."
  )
  .option(
    "-s, --source <source>",
    "Source Directory (Use quotes if directory contains spaces. Do not end in a backslash as it will escape your quote.)"
  )
  .option(
    "-d, --destination <destination>",
    "Destination Directory (Use quotes if directory contains spaces. Do not end in a backslash as it will escape your quote.)"
  )
  // .option("-r, --recursive", "recurse subdirectories")
  .option(
    "-f --folder <format>",
    "Folder Format (YYYY_MM|YYYY_MM_DD|YYYY\\MM||YYYY\\MM-MON|YYYY\\MM-Month)",
    /^(YYYY_MM|YYYY_MM_DD|YYYY\/MM||YYYY\/MM-MON|YYYY\/MM-Month)$/i,
    "YYYY/MM-Month"
  )
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
  .on("--help", function() {
    console.log()
    console.log("  " + chalk.bgYellow(" Examples: "))
    console.log()
    console.log(
      `   $ node ${path.basename(
        process.argv[1],
        ".js"
      )} -s "c:\\camera uploads" -d "c:\\My Photos" -f YYYY\/YYYY_MM`
    )
    console.log()
  })

program.parse(process.argv)

if (!program.source || !program.destination) {
  console.log(
    chalk`${
      os.EOL
    }{bgRed  Error: } {red source and destination folder required.}`
  )
  program.help()
}

if (program.dryRun || program.log) {
  program.log = program.log.replace("<source_directory>", program.source)
  let logPath = path.normalize(path.dirname(program.log))
  mkdirp.sync(logPath, function(err) {
    if (err)
      console.log(
        `${os.EOL}********${os.EOL}mkdirp Error: ${err}${os.EOL}******** `
      )
  })
  log = snl.createSimpleLogger(path.normalize(program.log))
  if (program.dryRun) {
    log.info(
      `Dry Run: Not sorting and moving photos. Simply displaying and logging what we would do if this was not a dry-run`
    )
  }
  log.info(
    `Logging info to console and log file ${path.normalize(program.log)}`
  )
  log.info(`Only moving files older than ${program.olderThan} days old`)
  log.info(
    `Destination folder structure: ${path.join(
      program.destination,
      program.folder
    )}`
  )
}

// function to determine what files and/or directories to exclude
function ignoreFunc(file, stats) {
  // Ignore directories named log or logs
  if (stats.isDirectory()) {
    return path.basename(file) == "log" || path.basename(file) == "logs"
  }
  // Ignore files with a .log extension
  if (path.extname(file) == ".log") {
    return true
  }
  // Ignore files less than N days old
  if (stats.mtime > moment().subtract(program.olderThan, "days")) {
    return true
  }
}

recursive(program.source, [ignoreFunc], function(err, files) {
  if (err) {
    log.error(`Could not read list of files. ${err}`)
    // process.exit(1)
  }
  let filesProcessed = 0

  // log.warn("files.length = " + files.length)
  // log.warn("files.toString() = " + files.toString())

  files.forEach(async function(file, index, array) {
    // let filePath = path.join(program.source, file)
    let filePath = path.normalize(file)
    let fileDate = await getFileDate(filePath)
    if (fileDate) {
      let toDir = await setDirectory(fileDate)
      let newPath = path.join(toDir, path.basename(file))
      if (program.dryRun) {
        log.info(`Dry Run: Would move ${filePath} to ${newPath}`)
        filesMoved++
      } else {
        log.info(`Moved ${filePath} to ${newPath}`)
        await moveFile(filePath, newPath).then(filesMoved++)
      }
    }
    filesProcessed++
    if (filesProcessed === array.length) {
      log.info(
        `${os.EOL}Files moved: ${filesMoved} ${os.EOL}Errors: ${fileErrors}`
      )
    }
  })
})

function getFileDate(file) {
  return new Promise((resolve, reject) => {
    let fileDate = []
    if (".jpg" == path.extname(file)) {
      try {
        new ExifImage({ image: file }, function(error, exifData) {
          if (error) {
            log.error(`ExifImage Error:  ${file} ${error.message}`)
            reject(`ExifImage Error:  ${file} ${error.message}`)
          } else {
            if (exifData.exif.DateTimeOriginal) {
              fileDate = exifData.exif.CreateDate.split(/[:| ]/, 3)
            } else if (exifData.exif.CreateDate) {
              fileDate = exifData.exif.CreateDate.split(/[:| ]/, 3)
            }
            if (fileDate[1]) {
              let logFileDate = fileDate[1]
              fileDate[1] = fileDate[1] - 1 // decrementing so log displays the correct month. monthsLong and monthsShort are ZERO based arrays
              fileDate[1] = fileDate[1].toString()
            }
          }
        })
      } catch (error) {
        log.error(`ExifImage Error: ${error.message}`)
        reject(`ExifImage Error: ${error.message}`)
      }
    }
    // if we don't have a file date because it is not a jpg or the jpg is missing exif data
    if (0 === fileDate.length) {
      // log.info(`YO: statSync this file ${file}`)
      let stats = fs.statSync(file)
      let fileMtime = new Date(stats.mtime)
      fileDate[0] = fileMtime.getFullYear().toString()
      let logFileDate = fileMtime.getMonth() + 1 // incrementing so log displays the correct month. monthsLong and monthsShort are ZERO based arrays
      fileDate[1] = fileMtime.getMonth().toString()
      fileDate[2] = fileMtime.getDate().toString()
    }
    // if still no fileDate log error that we cannot move this file
    if (0 === fileDate.length) {
      fileErrors++
      log.error(
        `Cannot move {$file} to datestamp directory because we cannot derive date from exif info or file create date.`
      )
      reject(
        `Cannot move {$file} to datestamp directory because we cannot derive date from exif info or file create date.`
      )
    } else {
      resolve(fileDate)
    }
  })
}

function setDirectory(fileDate) {
  return new Promise(resolve => {
    let dateFolder = null
    const monthsLong = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
    const monthsShort = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC"
    ]

    let monthNumber = (parseInt(fileDate[1]) + 1).toString() // to account for ZERO based monthsLong and monthsShort arrays

    // Compose directory based on folder set or default
    switch (program.folder) {
      case "YYYY_MM":
        dateFolder = `${fileDate[0]}_${monthNumber.padStart(2, "0")}`
        break
      case "YYYY_MM_DD":
        dateFolder = `${fileDate[0]}_${monthNumber.padStart(
          2,
          "0"
        )}_${fileDate[2].padStart(2, "0")}`
        break
      case "YYYY/MM":
        dateFolder = path.join(fileDate[0], monthNumber.padStart(2, "0"))
        break
      case "YYYY/MM-MON":
        dateFolder = `${path.join(fileDate[0], monthNumber.padStart(2, "0"))}-${
          monthsShort[fileDate[1]]
        }`
        break
      case "YYYY/MM-Month":
        dateFolder = `${path.join(fileDate[0], monthNumber.padStart(2, "0"))}-${
          monthsLong[fileDate[1]]
        }`
      default:
        dateFolder = `${path.join(fileDate[0], monthNumber.padStart(2, "0"))}-${
          monthsLong[fileDate[1]]
        }`
    }

    // Combine destination folder with date structure they chose
    let directory = path.join(program.destination, dateFolder)
    resolve(path.normalize(directory))
  })
}
