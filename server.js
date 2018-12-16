const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');


// HTTPサーバを生成する
const server = http.createServer(function(req, res) {

  const url = "app" + (req.url.endsWith("/") ? req.url + "index.html" : req.url);
  console.log(req.url);
  console.log(url);

  if (fs.existsSync(url)) {
    fs.readFile(url, (err, data) => {
      if (!err) {
        res.writeHead(200, {'Content-Type' : getType(url)});
        res.end(data);
      } else {
        res.statusCode = 500;
        res.end();
      }
    });
  } else {
    res.statusCode = 404;
    res.end();
  }
});


// Listen
const port = process.env.PORT || 7000;
server.listen(port, function() {
  console.log("Listening on: http://localhost:" + port);
});


function getType(_url) {
  const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "svg+xml"
  };
  for (let key in types) {
    if (_url.endsWith(key)) {
      return types[key];
    }
  }
  return "text/plain";
}


// HTTPサーバにソケットをひも付ける（WebSocket有効化）
const io = socketio.listen(server);