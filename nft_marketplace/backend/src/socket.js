const app = require("./app");
var server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (client) => {

  client.on('event', data => {
    console.log("user event", data);
    client.emit("hello", data);
  });

  client.on('hello', data => {
    io.sockets.emit("hello", { echo: 1 });
    console.log("user hello event", data);
  });

  client.on('disconnect', () => {
    console.log("user disconnected ");
  });
});

setInterval(() => {
    io.sockets.emit("ServerTime", Date.now());
}, 1000);


module.exports = {
  io,
 server
}