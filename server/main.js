var server = require('./server.js');

var port = process.env.TBN_PORT || '8080';

server.listen(port);
