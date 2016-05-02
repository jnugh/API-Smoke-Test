require('shelljs/global');

describe('Commandline interface', function() {
  it('should allow calling the program with different params', function() {
    exec('src/index.js list').code.should.equal(0);
    exec('src/index.js add test').code.should.not.equal(0); //Network error
    (function() { //Network error, but runs the code
      exec('src/index.js test').code.should.equal(0);
    }).should.throw();
  });
});
