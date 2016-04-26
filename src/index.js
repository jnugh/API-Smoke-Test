#!/usr/bin/env node
var program = require('commander');

process.argv[1] = __filename;

program
  .version('0.0.1')
  .command('config [key] [value]', 'Sets an apiUrl, which is beeing used to run the checks')
  .command('test', 'Checks all stored api calls for upstream changes')
  .command('list', 'Lists all stored api calls')
  .command('add <apiPath> [type]', 'Stores a new call for later tests')
  .command('remove <call>', 'Removes a call from the test suite')
  .command('revalidate <call>', 'Removes and adds a test, this is usefull when the API changed and the frontend has adopted to the changes')
  .parse(process.argv);
