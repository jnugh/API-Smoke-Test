var program = require('commander');

program.arguments('<apiPath> [type]')
  .action(function(apiPath, type) {
    console.log(type, apiPath);
  })
  .parse(process.argv);
