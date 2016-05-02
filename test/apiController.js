process.env.SMOKE_CONFIG_FILE = './testcfg';
process.env.STORE_DIR = './testStore';

var should = require('should'),
    controller = require('../src/apis/apiController'),
    store = require('../src/apis/apiStore'),
    http = require('http'),
    config = require('../src/config/configController'),
    nock = require('nock');

describe('API Controller', function(){

  describe('Result merging', function() {
    it('should merge two arrays', function() {
      controller.mergeResultData(['val1', 'val2'], ['val3', 'val4'])
        .should.deepEqual(['val1', 'val2', 'val3', 'val4']);
    });

    it('should return the first array when the other input is true', function() {
      controller.mergeResultData(['val1', 'val2'], true)
        .should.deepEqual(['val1', 'val2']);
    });

    it('should return the second array when the other input is true', function() {
      controller.mergeResultData(true, ['val1', 'val2'])
        .should.deepEqual(['val1', 'val2']);
    });

    it('should return true when both inputs are true', function() {
      controller.mergeResultData(true, true)
        .should.equal(true);
    });
  });

  describe('valid data', function() {
    var apiData = {
      root: [{
        'this': 'is',
        data: true
      }]
    };


    beforeEach(function(done) {
      config.setUrl('http://localhost:1234');

      nock('http://localhost:1234')
        .get('/test')
        .socketDelay(2000) // 2 seconds
        .reply(200, JSON.stringify(apiData));

      store.clear(done);
    });

    it('should fetch the API url', function(done) {
      controller.fetchApi('test', function(data) {
        data.should.deepEqual(apiData);
        done();
      });
    });

    it('should be possible to add an api call to the store', function(done) {
      controller.addApi('test', function() {
        controller.getStoredResult('test', function(err, data) {
          data.should.deepEqual(apiData);
          done();
        })
      });
    });

    afterEach(function() {
      nock.cleanAll();
    });
  });

  describe('api value changes', function() {
    var apiData = {
      root: [{
        'this': 'is',
        data: true,
        more: null
      }]
    },
    apiData2 = {
      root: [{
        'this': 'was',
        data: false,
        more: null
      }]
    };;


    beforeEach(function(done) {
      config.setUrl('http://localhost:1234');

      nock('http://localhost:1234')
        .get('/test')
        .socketDelay(2000) // 2 seconds
        .reply(200, JSON.stringify(apiData));

      store.clear(function() {
        controller.addApi('test', function() {
          nock.cleanAll();
          nock('http://localhost:1234')
            .get('/test')
            .socketDelay(2000) // 2 seconds
            .reply(200, JSON.stringify(apiData2));
          done();
        });
      });
    });

    it('should be a valid api "change"', function(done) {
      controller.testApi('test', function(result) {
        result.should.be.true();
        done();
      });
    });

    afterEach(function() {
      nock.cleanAll();
    });
  });

  describe('api internal type changes', function() {
    var apiData = {
      root: [{
        'this': 'is',
        data: true
      }]
    },
    apiData2 = {
      root: [{
        'this': false,
        data: 1
      }]
    };;


    beforeEach(function(done) {
      config.setUrl('http://localhost:1234');

      nock('http://localhost:1234')
        .get('/test')
        .socketDelay(2000) // 2 seconds
        .reply(200, JSON.stringify(apiData));

      store.clear(function() {
        controller.addApi('test', function() {
          nock.cleanAll();
          nock('http://localhost:1234')
            .get('/test')
            .socketDelay(2000) // 2 seconds
            .reply(200, JSON.stringify(apiData2));
          done();
        });
      });
    });

    it('should be a valid api "change"', function(done) {
      controller.testApi('test', function(result) {
        result.length.should.equal(2);
        for(var i = 0; i < result.length; i++) {
          result[i].severity.should.equal('breaking');
        }
        done();
      });
    });

    afterEach(function() {
      nock.cleanAll();
    });
  });

  describe('api change empty array', function() {
    var apiData = {
      root: [{
        'this': 'is',
        data: true
      }]
    },
    apiData2 = {
      root: []
    };;


    beforeEach(function(done) {
      config.setUrl('http://localhost:1234');

      nock('http://localhost:1234')
        .get('/test')
        .socketDelay(2000) // 2 seconds
        .reply(200, JSON.stringify(apiData));

      store.clear(function() {
        controller.addApi('test', function() {
          nock.cleanAll();
          nock('http://localhost:1234')
            .get('/test')
            .socketDelay(2000) // 2 seconds
            .reply(200, JSON.stringify(apiData2));
          done();
        });
      });
    });

    it('should be a warning api change', function(done) {
      controller.testApi('test', function(result) {
        result.length.should.equal(1);
        for(var i = 0; i < result.length; i++) {
          result[i].severity.should.equal('warning');
          result[i].path.should.equal('->root[]');
        }
        done();
      });
    });

    afterEach(function() {
      nock.cleanAll();
    });
  });

  describe('api change new object field', function() {
    var apiData = {
      root: [{
        'this': 'is',
        data: true
      }]
    },
    apiData2 = {
      root: [{
        'this': 'is',
        data: true,
        more: 'data'
      }]
    };;


    beforeEach(function(done) {
      config.setUrl('http://localhost:1234');

      nock('http://localhost:1234')
        .get('/test')
        .socketDelay(2000) // 2 seconds
        .reply(200, JSON.stringify(apiData));

      store.clear(function() {
        controller.addApi('test', function() {
          nock.cleanAll();
          nock('http://localhost:1234')
            .get('/test')
            .socketDelay(2000) // 2 seconds
            .reply(200, JSON.stringify(apiData2));
          done();
        });
      });
    });

    it('should be an info valid api change', function(done) {
      controller.testApi('test', function(result) {
        result.length.should.equal(1);
        for(var i = 0; i < result.length; i++) {
          result[i].severity.should.equal('info');
          result[i].path.should.equal('->root[0]->more');
        }
        done();
      });
    });

    afterEach(function() {
      nock.cleanAll();
    });
  });

  describe('api change removed object field', function() {
    var apiData = {
      root: [{
        'this': 'is',
        data: true,
        more: 'data'
      }]
    },
    apiData2 = {
      root: [{
        'this': 'is',
        data: true
      }]
    };


    beforeEach(function(done) {
      config.setUrl('http://localhost:1234');

      nock('http://localhost:1234')
        .get('/test')
        .socketDelay(2000) // 2 seconds
        .reply(200, JSON.stringify(apiData));

      store.clear(function() {
        controller.addApi('test', function() {
          nock.cleanAll();
          nock('http://localhost:1234')
            .get('/test')
            .socketDelay(2000) // 2 seconds
            .reply(200, JSON.stringify(apiData2));
          done();
        });
      });
    });

    it('should be a breaking valid api change', function(done) {
      controller.testApi('test', function(result) {
        result.length.should.equal(1);
        for(var i = 0; i < result.length; i++) {
          result[i].severity.should.equal('breaking');
          result[i].path.should.equal('->root[0]->more');
        }
        done();
      });
    });

    afterEach(function() {
      nock.cleanAll();
    });
  });

  describe('invalid api data', function() {
    var apiData = {
      root: [{
        'this': 'is',
        data: true,
        more: 'data'
      }]
    };


    beforeEach(function(done) {
      config.setUrl('http://localhost:1234');

      nock('http://localhost:1234')
        .get('/test')
        .socketDelay(2000) // 2 seconds
        .reply(200, JSON.stringify(apiData));

      store.clear(function() {
        controller.addApi('test', function() {
          nock.cleanAll();
          nock('http://localhost:1234')
            .get('/test')
            .socketDelay(2000) // 2 seconds
            .reply(200, 'INVALID JSON');
          done();
        });
      });
    });

    it('should fail the execution', function(done) {
      controller.testApi('test', function(result) {

      });
      setTimeout(function() {
        process.exitCode.should.not.equal(0);
        done();
      }, 100);
    });

    afterEach(function() {
      nock.cleanAll();
    });
  });
});
