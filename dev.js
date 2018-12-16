const http = require('http');
const wh = require('./wh');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(wh);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
