var program = require('commander');
 
program
  .command('ls <dir>')
  .option('-r, dir --recursive', 'Remove recursively')
  .action(function (dir, cmd) {
    console.log('remove ' + dir + (cmd.recursive ? ' recursively' : ''))
  })
 
program.parse(process.argv)