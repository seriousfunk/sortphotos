const mkdirp = require("mkdirp")

// const logPath = "d:\\Dropbox\\Matt\\node-apps\\sortphotos\\testdir\\zzz"
// use non - existent drive(t: ) to test catch ()
const logPath = "t:\\Dropbox\\Matt\\node-apps\\sortphotos\\testdir\\zzz"

console.log('\nlogPath: ' + logPath + '\n\n')

mkdirp(logPath)
  .then(made => {
    if (made == undefined) {
      console.log('Directory already existed. I did not need to make it :)')
    }
    else {
      console.log(`made directories, starting with ${made}`)
    }
  })
  .catch(error => {
    console.error(`Cannot make log directory: ${error}`)
    process.exit()
  })
  .then(
    console.log('run rest of program')
  )

