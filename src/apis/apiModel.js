var config = require('../config/configController')
    controller = require('http');


module.exports = function(api, data) {
  this.api = api;
  this.data = data;

  this.serialize = function() {
    return {
      api: this.api,
      data: this.data
    };
  }
}
