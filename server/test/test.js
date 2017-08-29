var server = require('../server');
var assert = require('assert');
var http = require('http');

describe('/', function () {
  before(function () {
    server.listen(8000);
  });

  after(function () {
    server.close();
  });
  it('should return 200', function (done) {
    http.get('http://localhost:8000', function (res) {
      assert.equal(200, res.statusCode);
      done();
    });
  });

  it('return a hex color', function (done) {
    http.get('http://localhost:8000', function (res) {
      var data = '';

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        data = data.trim();
        assert(data.length == 6);
        var color = parseInt("0x" + data);
        assert(color >= 0);
        assert(color <= 0xFFFFFF + 1);
        done();
      });
    });
  });
});
