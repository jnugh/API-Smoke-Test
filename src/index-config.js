var program = require('commander'),
    config = require('./config/configController');

program.arguments('<key> [value]')
  .action(function(key, value) {
    switch(key) {
      case 'url':
        if(typeof value === 'undefined') {
          return console.log(config.getUrl());
        }
        return config.setUrl(value);
    }
  })
  .parse(process.argv);
