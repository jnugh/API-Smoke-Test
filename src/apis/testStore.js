var fs = require('fs')
    path = require('path'),
    sha256 = require('js-sha256').sha256;

module.exports = {
  getPath: function() {
    return process.env.STORE_DIR || require('homedir')() + path.sep + '.salSmokeStore';
  },

  clear: function(cb) {
    var me = this,
        storePath = me.getPath();
    if(typeof cb === 'undefined') {
      cb = function(){};
    }

    fs.readdir(storePath, function(err, files) {
      if(err) {
        if(err.code == 'ENOENT') {
          return cb();
        } else {
          throw err;
        }
      }
      var count = files.length;
      if(count == 0) {
        cb();
        return;
      }

      for(var i = 0; i < files.length; i++) {
        fs.unlink(storePath + path.sep + files[i], function(err) {
          if(err) {
            throw err;
          }
          count--;
          if(count == 0) {
            me.storeContent = [];
            cb();
          }
        });
      }
    });
  },

  /**
   * Checks is store dir exists and creates it if not
   * SYNC!
   */
  ensureStore: function() {
    var me = this,
        storePath = me.getPath();

    try {
      fs.mkdirSync(storePath)
    } catch(e) {
      if(e.code != 'EEXIST')
        throw e;
    }
  },

  /**
   * Reads the store SYNC!
   */
  readStore: function() {
    var me = this,
        storePath = me.getPath();

    return fs.readdirSync(storePath);
  },

  init: function() {
    var me = this,
        storePath = me.getPath();

    me.ensureStore();
    me.storeContent = me.readStore();
  },

  size: function() {
    var me = this;
    return me.storeContent.length;
  },

  sanitizeFileName: function(key) {
    var match = /[a-zA-Z0-9-_]/,
        hash = sha256(key),
        newKey = '';

    for(var i = 0; i < key.length; i++) {
      if(key[i].match(match) === null) {
        newKey += '-';
      } else {
        newKey += key[i];
      }

    }
    return newKey + hash;
  },

  add: function(key, data, cb) {
    var me = this,
        storePath = me.getPath(),
        saneFileName = me.sanitizeFileName(key),
        exists = false;

    if(typeof cb === 'undefined') {
      cb = function(){};
    }

    var write = function(err) {
      if(err && err.code === 'ENOENT') {
        fs.writeFile(storePath + path.sep + saneFileName, JSON.stringify(data), 'utf8', function(err) {
          if (err) console.log('Could not store data: ', err);
          else {
            me.storeContent.push(saneFileName);
          }
          cb(err);
        });
      } else {
        cb(err);
      }
    }
    fs.access(storePath + path.sep + saneFileName, fs.F_OK | fs.W_OK, write);
  },

  read: function(key, cb) {
    var me = this,
        storePath = me.getPath(),
        saneFileName = me.sanitizeFileName(key);

    fs.readFile(storePath + path.sep + saneFileName, function(err, data) {
      if(!err) {
        data = JSON.parse(data);
      }
      cb(err, data);
    });
  },

  remove: function(key, cb) {
    var me = this,
        storePath = me.getPath(),
        saneFileName = me.sanitizeFileName(key),
        index = me.storeContent.indexOf(saneFileName);

    if(typeof cb === 'undefined') {
      cb = function(){};
    }

    if(index === -1) {
      return cb();
    }



    fs.unlink(storePath + path.sep + saneFileName, cb);
    me.storeContent.splice(index, 1);
  },

  update: function(key, data, cb) {
    var me = this;

    me.remove(key, function() {
      me.add(key, data, cb);
    });
  }
}

module.exports.init();
