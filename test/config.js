var should = require('should');

process.env.SMOKE_CONFIG_FILE = './testcfg';
process.env.STORE_DIR = './testStore';

describe('config', function() {
  var config = require('../src/config/configController');
  it('should fail on an invalid url', function() {
    config.setUrl.should.be.type('function');
    (function() {
      config.setUrl('invalidURL');
    }).should.throw();
    config.getUrl().should.not.equal('invalidURL');
  });

  it('should be possible to set a valid url', function() {
    (function() {
      config.setUrl('http://localhost');
    }).should.not.throw();
  });

  it('should really store the url', function() {
    config.setUrl('http://localhost');
    config.getUrl().should.equal('http://localhost');
    config.setUrl('https://localhost');
    config.getUrl().should.equal('https://localhost');
  });
});
