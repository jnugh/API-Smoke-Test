var program = require('commander'),
    apiController = require('./apis/apiController');

program.arguments('<apiPath> [type]')
  .action(function(apiPath, type) {
    if(type) {
      console.warn('Types are not yet supported');
    }
    apiController.addApi(apiPath, function(err) {
      if(err) {
        console.error('Could not store api call: "' + err + '" maybe you want to revalidate the call?');
      }
    });
  })
  .parse(process.argv);
