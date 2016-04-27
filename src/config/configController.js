var validUrl = require('valid-url'),
    fs = require('fs'),
    path = require('path');

module.exports = {
  writing: false,
  config: {},

  setUrl: function(url) {
    var me = this;
    if(!validUrl.isWebUri(url)) {
      throw 'URL is invalid';
    }
    me.config.apiUrl = url;
    this.sync();
  },

  getUrl: function() {
    var me = this;
    return me.config.apiUrl || 'https://localhost';
  },

  sync: function() {
    var me = this;
    if(me.writing) {
      setTimeout(me.sync.bind(me), 100);
      return;
    }
    me.writing = true;
    fs.writeFile(me.getPath(), JSON.stringify(me.config), 'utf8', function(err) {
      if (err) return console.log('Could not store config: ' + err);
      me.writing = false;
    });
  },

  loadConfig: function() {
    var me = this,
        path = me.getPath();

    if(me.ensureConfig(path)) {
      me.config = JSON.parse(fs.readFileSync(path, 'utf8'));
    }
  },

  getPath: function() {
    return process.env.CONFIG_FILE || './salSmokeConf';
  },

  ensureConfig: function(path) {
    try {
      fs.accessSync(path, fs.F_OK)
    } catch(e) {
      return false;
    }
    return true;
  }
};

module.exports.loadConfig();
