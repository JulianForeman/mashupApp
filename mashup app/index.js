const http = require('http');

const server = http.createServer((req, res) => {
	let now = new Date();
	let message = "[" + now + "]" + req.method + " " + req.url;
	console.log(message);
	res.write("You've been web served");
	res.end();
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
