var should = require('should');
var store = require('../src/apis/testStore');

process.env.CONFIG_FILE = './testcfg';
process.env.STORE_DIR = './testStore';

describe('testStore', function() {
  beforeEach(function(done) {
    store.clear(done);
  });

  it('should be possible to clear the store', function(done) {
    var cleanFn = function() {
      store.clear(function() {
        store.size().should.equal(0);
        done();
      });
    };

    store.add('testData#', {
      test: true
    }, function() {
      store.size().should.equal(1);
      cleanFn();
    });
  });

  it('should generate sane file names', function() {
    var match = /^[a-zA-Z0-9_\-]*$/;
    store.sanitizeFileName('äöü+ü#1239021487372645-.--:;)/)@').match(match).index.should.equal(0);
  });

  it('should not be possible to store the same key multiple times', function(done) {
    store.add('testData#', {
      test: true
    }, function() {
      store.size().should.equal(1);
      store.add('testData#', {
        test: true
      }, function() {
        store.size().should.equal(1);
        done();
      });
    });
  });

  it('should be possible to add multiple keys with names that differ by forbidden chars', function(done) {
    store.add('testData#', {
      test: true
    }, function() {
      store.size().should.equal(1);
      store.add('testData@', {
        test: true
      }, function() {
        store.size().should.equal(2);
        done();
      });
    });
  });

  it('should be possible to read stored data', function(done) {
    store.add('testData#', {
      test: true
    }, function() {
      store.size().should.equal(1);
      store.read('testData#', function(err, data) {
        (err == null).should.be.true();
        data.should.deepEqual({
          test: true
        });
        done();
      });
    });
  });

  it('should not be possible to read data that has not been stored', function(done) {
    store.read('testDat_a#', function(err, data) {
      err.should.not.equal(null);
      done();
    });
  });

  it('should be possible to remove a record', function(done) {
    store.add('testData#', {
      test: true
    }, function() {
      store.size().should.equal(1);
      store.remove('testData#', function() {
        store.size().should.equal(0);
        done();
      });
    });
  });

  it('should finish silently when deleting something, which doe snot exist', function(done) {
    var oldSize = store.size();
    store.remove('testData#', function() {
      store.size().should.equal(oldSize);
      done();
    });
  });
})
