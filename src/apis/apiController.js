var config = require('../config/configController'),
    store = require('./apiStore'),
    http = require('http');

module.exports = {
  fetchApi: function(api, cb) {
    var me = this;
    var url = config.getUrl().replace(/^[a-zA-Z]*\:\/\//, ''),
        port = 80;
    if(url.substring(url.lastIndexOf(':')).match(/[0-9]+/)) {
      port = url.substring(url.lastIndexOf(':') + 1);
      url = url.substring(0, url.lastIndexOf(':'));
    }

    var options = {
      host: url,
      port: port,
      path: '/' + api
    };

    if(config.getCurlOptions()) {
      var curl = require('curlrequest');
      var curlOptions = config.getCurlOptions();
      curlOptions.url = options.host + ':' + options.port + options.path;
      curl.request(curlOptions, function (err, body) {
        try{
          cb(JSON.parse(body));
        } catch(e) {
          console.log('could not parse:', body);
          process.exitCode = 1;
        }
      });
    } else {
      http.get(options, function(res) {
        var body = '';
        res.on('data', function(chunk) {
          body += chunk;
        });
        res.on('end', function() {
          try{
            cb(JSON.parse(body));
          } catch(e) {
            console.log('could not parse:', body);
            process.exitCode = 1;
          }
        });
      }).on('error', function(e) {
        throw 'Fetch failed: ' + e.message;
      });
    }
  },

  addApi: function(api, cb) {
    this.fetchApi(api, function(data) {
      store.add(api, {
        api: api,
        data: data
      }, cb);
    });
  },

  getStoredResult: function(api, cb) {
    store.read(api, function(err, data) {
      if(err)
        cb(err, data);
      else
        cb(err, data.data);
    });
  },

  mergeResultData: function(d1, d2) {
    if(d1 == true) {
      return d2;
    }
    if(d2 == true) {
      return d1;
    }
    return d1.concat(d2);
  },

  traverseCompareObject: function(newData, old, path) {
    var me = this,
        newKeys = Object.keys(newData),
        oldKeys = Object.keys(old),
        result = [];

    for(var i = 0; i < newKeys.length; i++) {
      var thisPath = path + '->' + newKeys[i];
      if(oldKeys.indexOf(newKeys[i]) === -1) {
        result.push({
          severity: 'info',
          type: 'new data in object',
          newType: typeof newData[newKeys[i]],
          newData: newData[newKeys[i]],
          path: thisPath
        });
      } else {
        result = me.mergeResultData(
          result,
          me.doCompare(newData[newKeys[i]], old[newKeys[i]], thisPath)
        );
      }
    }

    for(var i = 0; i < oldKeys.length; i++) {
      var thisPath = path + '->' + oldKeys[i];
      if(newKeys.indexOf(oldKeys[i]) === -1) {
        result.push({
          severity: 'breaking',
          type: 'missing data in object',
          oldType: typeof old[oldKeys[i]],
          oldData: old[oldKeys[i]],
          path: thisPath
        });
      }
    }

    return result.length === 0 || result;
  },

  traverseCompareArray: function(newData, old, path) {
    var results = [];
    if(newData.length == 0 || old.length == 0) {
      results.push({
        severity: 'warning',
        type: 'array compare failed, one is empty',
        oldData: old,
        newData: newData,
        path: path + '[]'
      });
    } else {
      return this.doCompare(newData[0], old[0], path + '[0]');
    }
    return results.length === 0 || results;
  },

  doCompare: function(newData, old, path) {
    var me = this,
        oldType = typeof old;
        newType = typeof newData;

    if(oldType !== newType) {
      return [{
        severity: 'breaking',
        type: 'incompatible type',
        oldType: oldType,
        newType: newType,
        oldData: old,
        newData: newData,
        path: path
      }];
    }

    var type = oldType;

    switch(type) {
      case 'object':
        if(Array.isArray(newData)) {
          return me.traverseCompareArray(newData, old, path);
        } else {
          return me.traverseCompareObject(newData, old, path);
        }
      break;
      case 'array':
        return me.traverseCompareArray(newData, old, path);
      break;
      default:
      return true;
    }

    return true;

  },

  testApi: function(api, cb) {
    var me = this,
        fetched = false,
        restored = false;

    var storedCb = function(err, data) {
      if(err) {
        throw err;
      }
      restored = data;
      if(fetched !== false && restored !== false) {
        cb(me.doCompare(fetched, restored, ''), api);
      }
    }

    var fetchCb = function(data) {
      fetched = data;
      if(fetched !== false && restored !== false) {
        cb(me.doCompare(fetched, restored, ''), api);
      }
    }

    this.getStoredResult(api, storedCb);
    this.fetchApi(api, fetchCb);
  },

  testAll: function(cb) {
    var me = this;
    store.forEach(function(err, data) {
      if(err) {
        console.err(err);
      } else {
        me.testApi(data.api, cb);
      }
    });
  }
}
