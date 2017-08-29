var http = require('http');

var port = process.env.TBN_PORT || '8080';
var body = (process.env.TBN_COLOR || 'FFFAC3') + "\n";
var name = (process.env.TBN_NAME || 'unknown').toLowerCase();

// Box-Muller transform of uniformly distributed random numbers to
// normal distribution, discarding one of the produced values to avoid
// tracking state.
var nextRand = function(mean, variance) {
  var u1 = 0;
  do {
    u1 = Math.random();
  } while (u1 <= Number.EPSILON);

  var u2 = 0;
  do {
    u2 = Math.random();
  } while (u2 <= Number.EPSILON);

  var z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * variance + mean;
};

var getDelay = function(meanDelay) {
  var delay = nextRand(meanDelay, meanDelay / 4.0);
  return Math.max(delay, 0);
};

var doRequest = function(request, response, body, fail) {
  var allowHeaders = request.headers['access-control-request-headers'];

  headers = {
    'Content-Length': fail ? 0 : Buffer.byteLength(body),
    'Access-Control-Allow-Origin': "*"
  };

  if (allowHeaders) {
    headers['Access-Control-Allow-Headers'] = allowHeaders;
  }

  if (fail) {
    response.writeHead(500, headers);
    response.end();
  } else {
    response.writeHead(200, headers);
    response.end(body);
  }
};

var handleRequest = function(request, response) {
  var delay = 0;
  var errorRate = 0;

  if (name != 'unknown') {
    var meanDelay = Number(request.headers['x-' + name + '-delay'] || '0');
    if (meanDelay > 0) {
      delay = getDelay(meanDelay);
    }

    errorRate = Number(request.headers['x-' + name + '-error'] || '0');
  }

  var fail = errorRate > 0 && Math.random() < errorRate;

  console.log(
    'Request: ' + request.url +
      (delay > 0 ? '; delay ' + delay + ' ms' : '') +
      (fail ? '; failing' : '; OK'));

  if (delay > 0.0) {
    setTimeout(doRequest, delay, request, response, body, fail);
  } else {
    setImmediate(doRequest, request, response, body, fail);
  }
};

this.server = http.createServer(handleRequest);
exports.listen = function() {
  this.server.listen.apply(this.server, arguments);
}

exports.close = function(callback) {
  this.server.close(callback);
}
