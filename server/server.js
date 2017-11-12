const express = require('express');
const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '../public' )
const socketIO = require('socket.io');
const fs = require('fs');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const port = process.env.PORT || 8080;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var users = new Users();

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

// a single server handles all the connections
io.on('connection', function(socket){
  console.log(`A user connected on ${new Date()}`);

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required');
    }
    // io.emit() emit an event to all users socket in io
    // socket.broadcast.emit() broadcast an event to all other sockets
    // socket.emit() emit to the current client socket

    socket.join(params.room);
    if (users.removeUser(socket.id) || users.removeUserByName(params.name, params.room)) {
      return callback('User has joined! Try another user name!');
    }
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));

    socket.emit('newMessage', generateMessage('Welcome to the chat room!', 'Admin'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', ` ${params.name} joined!`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if (user && coords) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
    }
  });
  // check typing status
  socket.on('typing', (userInfo) => {
    var user = users.users.filter((user) => user.name === userInfo.userName && user.room === userInfo.userRoom)[0];
    var room = user.room;
    socket.to(room).emit('typing', user.name);
  });

  socket.on('stop typing', (userInfo) => {
    var user = users.users.filter((user) => user.name === userInfo.userName && user.room === userInfo.userRoom)[0];
    var room = user.room;
    socket.to(room).emit('stop typing', user.name);
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`))
    }
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Servr is on port 8080...`);
});
