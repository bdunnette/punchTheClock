var lt = require('loopback-testing');
var assert = require('assert');
var app = require('../server/server.js'); //path to app.js or server.js

describe('/People', function() {
  lt.beforeEach.withApp(app);
  lt.describe.whenCalledRemotely('GET', '/api/People', function() {
    lt.it.shouldBeAllowed();
    it('should have statusCode 200', function() {
      assert.equal(this.res.statusCode, 200);
    });

    lt.beforeEach.givenModel('Person', {name:'foo'});
    it('should respond with an array of people', function() {
      assert(Array.isArray(this.res.body));
    });
  });
});
