var program = require('commander'),
    apiController = require('./apis/apiController')
    colors = require('colors'),
    ran = false;

var testCb = function(result, apiCall) {
  console.log('Test results for ' + apiCall.bold);
  if(result === true) {
    process.exit(0);
  } else {
    for(var i = 0; i < result.length; i++) {
      var info = result[i];
      switch(info.severity) {
        case 'info':
          console.log('Info:'.underline.green);
          break;
        case 'warning':
          console.log('Warning:'.underline.yellow);
          break;
        case 'breaking':
          process.exitCode = 1;
          console.log('Breaking API change:'.underline.red);
          break;
      }
    }
    console.log(info.type + ': (' + info.path + ')');
    console.log('old type: ' + info.oldType);
    console.log('new type: ' + info.newType)
    if(program.verbose) {
      console.log('old data: ', info.oldData);
      console.log('new data: ', info.newData);
    }
  }
}

program.arguments('[apiPath]')
  .option('-v, --verbose', 'show api dump')
  .action(function(apiPath, options) {
    ran = true;
    if(apiPath) {
      apiController.testApi(apiPath, testCb);
    }
  })
  .parse(process.argv);

if(!ran) {
   apiController.testAll(testCb);
 }
