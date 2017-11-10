const express = require('express');
const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '../public' )
const socketIO = require('socket.io');
const fs = require('fs');
const {generateMessage} = require('./utils/message');
const port = process.env.PORT || 8080;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use('/', (req, res, next) => {
  var visitLog = [
    new Date(),
    req.method,
    req.url,
    req.ip
  ].join(' ');
  fs.appendFile('server.log', visitLog + '\n', (err) => {
    if (err) {
      console.log('Unable to log the user!');
    }
  });
  next();
});
app.use(express.static(publicPath));

io.on('connection', function(socket){
  console.log(`A user connected on ${new Date()}`);

  socket.emit('newMessage', generateMessage('Welcome to the chat room!', 'Admin'));

  socket.broadcast.emit('newMessage', generateMessage('admin', 'New user joined!'));

  socket.on('createMessage', (message, callback) => {
    console.log('createMessage', message);
    io.emit('newMessage', generateMessage(message.from, message.text);
    callback('This from the server.');
  });


  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

});



server.listen(port, () => {
  console.log(`Servr is on port 8080...`);
});
