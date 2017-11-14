const config = require('./../config/config');
const express = require('express');
const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '../public' );
const socketIO = require('socket.io');
const fs = require('fs');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {UsersList} = require('./utils/usersList');
const {User} = require('./models/user');
const {mongoose} = require('./db/mongoose');
const {Room} = require('./models/room');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var usersList = new UsersList();

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

  socket.on('getRoomList', (callback) => {
    var roomList;
    Room.getRoomList().then((rooms) => {
      roomList = rooms;
      callback(roomList);
    });
  });
 // join a room, return all history messages
  socket.on('join', (params, callback) => {
    var roomId = params.roomId;
    var userToken = params.userToken;

    var user;
    var roomDoc;

    // Async function, non-blocking!!!
    User.findByToken(userToken).then((userDoc) => {
      if (!userDoc) {
        throw new Error('Invalid User!');
      }
      user = userDoc;
      return Room.findById(roomId);
    }).then((tempRoomDoc) => {
      if (!tempRoomDoc) {
        throw new Error('Invalid Room!');
      }
      roomDoc = tempRoomDoc;
      socket.join(roomId);
      if (usersList.removeUser(socket.id) || usersList.removeUserByName(params.displayName, params.roomId)) {
        return callback('User has joined! Try another user name!');
      }
      usersList.addUser(socket.id, params.displayName, roomId, user.name);
      io.to(roomId).emit('updateUserList', usersList.getUserList(roomId));

      for (var i = 0; i < roomDoc.messages.length; i++) {
        var newMessage = {
          from: roomDoc.messages[i].from,
          text: roomDoc.messages[i].content,
          createdAt: roomDoc.messages[i].createdAt
        };
        io.to(roomId).emit('newMessage', newMessage);
      }
      socket.emit('newMessage', generateMessage('Welcome to the chat room!', 'Admin'));
      socket.broadcast.to(roomId).emit('newMessage', generateMessage('Admin', ` ${params.displayName} joined!`));
      callback();
    }).catch((err) => {
      callback(err);
    });
  });

  /*****Typing Status*****/
  socket.on('typing', (userInfo) => {
    var user = usersList.users.filter((user) => user.displayName === userInfo.userName && user.roomId === userInfo.userRoom)[0];
    var room = user.roomId;
    socket.to(room).emit('typing', user.displayName);
  });

  socket.on('stop typing', (userInfo) => {
    var user = usersList.users.filter((user) => user.displayName === userInfo.userName && user.roomId === userInfo.userRoom)[0];
    var room = user.roomId;
    socket.to(room).emit('stop typing', user.displayName);
  });
  /*****Message Utility*****/
  socket.on('createMessage', (message, callback) => {
    var user = usersList.getUser(socket.id);
    var roomId = user.roomId;
    if (user && isRealString(message.text)) {
      var message = generateMessage(user.displayName, message.text);
      io.to(user.roomId).emit('newMessage', message);
    }
    var message = {
      content: message.text,
      from: user.userName,
      createdAt: message.createdAt,
      alias:user.displayName,
      roomId: user.roomId
    };
    Room.findById(roomId).then((roomDoc) => {
      if (!roomDoc) {
        callback(err);
      }
      roomDoc.messages.push(message);
      roomDoc.save().then((roomDoc) => {
        if (!roomDoc) {
          callback('Unable to save message!');
        }
      });
      callback();
    }).catch((err) => callback(err));
  });

  socket.on('createLocationMessage', (coords) => {
    var user = usersList.getUser(socket.id);
    var roomId = user.roomId;
    if (user && coords) {
      var locationMessage = generateLocationMessage(user.displayName, coords.latitude, coords.longitude);
      io.to(user.roomId).emit('newLocationMessage', locationMessage);
    }
    var message = {
      url: locationMessage.url,
      from: user.userName,
      createdAt: locationMessage.createdAt,
      alias:user.displayName,
      roomId: user.roomId
    };
    Room.findById(roomId).then((roomDoc) => {
      if (!roomDoc) {
        callback(err);
      }
      roomDoc.messages.push(message);
      roomDoc.save().then((roomDoc) => {
        if (!roomDoc) {
          callback('Unable to save message!');
        }
      });
      callback();
    }).catch((err) => callback(err));
  });
  // verify a user by the token
  socket.on('verifyUserByToken', (token, callback) => {
    User.findByToken(token.token).then((user) =>{
      if (!user) {
        callback('Error');
      }
    }).catch((err) => {
      callback(err);
    });
  });
  // registeration
  socket.on('registerUser', (userInfo, callback) => {
    var user = new User({
      name: userInfo.userName,
      email: userInfo.userEmail,
      password: userInfo.userPassword
    });
    // check email
    User.findOne({email: user.email}).then((user) => {
      if (user) {
        return callback('The email was already registered!');
      }
    });
    user.save().then((user) => {
      user.generateAuthToken().then((token) => {
        callback(null, user, token);
      })
    }).catch((err) => {
      callback(err.message);
    });
  });
  // login
  socket.on('login', (user, callback) => {
    User.findByCredentials(user.email, user.password).then((user) => {
      if (!user) {
        callback('No such User!');
      }
      user.generateAuthToken().then((token) => {
        callback(null, user, token);
      });
    }).catch((err) => {
      callback(err);
    });
  });
  // logout
  socket.on('logout', (tokenObject, callback) => {
    User.findByToken(tokenObject.token).then((user) => {
      if (!user) {
        callback('Error!');
      }
      user.removeToken().then((user) => {
        if (user) {
          callback('Logged out!')
        }
      });
      callback();
    });
  });
  // create a new room
  socket.on('newRoom', (room, callback) => {
    Room.findOne({name: room.roomName}).then((room) => {
      if (room) {
        callback('Room name already exists, please choose another one!');
      }
    });

    var room = new Room({name: room.roomName});
    room.save().then((room) => {
      callback(null, room);
    }).catch((e) => callback(err));
  });
  // get a room
  socket.on('getRoom', (room, callback) => {
    Room.findOne({name: room.roomName}).then((room) => {
      if (!room) {
        callback('No Such room!');
      }
      callback(null, room);
    }).catch((err) => callback(err));
  });
  // remove a user
  socket.on('disconnect', () => {
    var user = usersList.removeUser(socket.id);
    if (user) {
      io.to(user.roomId).emit('updateUserList', usersList.getUserList(user.roomId));
      io.to(user.roomId).emit('newMessage', generateMessage('Admin', `${user.displayName} has left.`))
    }
    console.log('User disconnected');
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Servr is on port 8080...`);
});
