const express = require('express');
const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '../public' )
const socketIO = require('socket.io');
const fs = require('fs');

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

  // socket.emit('newEmail', {
  //   title: 'Hello cliet',
  //   from: 'kevinzh@udel.edu'
  // });

  // socket.emit('newMessage', {
  //   from: 'Pengcheng',
  //   text: 'when can i fuck you?',
  //   createdAt: new Date()
  // });
  //
  // // socket.on('createEmail', (newEmail) => {
  // //   console.log('createEmail', newEmail);
  // // });

  socket.on('createMessage', (newMessage) => {
    socket.broadcast.emit('newMessage', {
      from: newMessage.from,
      text: newMessage.text,
      createdAt: new Date().getTime(),
    });
    console.log(newMessage);
  });

  socket.on('disconnect', function(){
    console.log('User disconnected');
  });
});


server.listen(port, () => {
  console.log(`Servr is on port 8080...`);
});
