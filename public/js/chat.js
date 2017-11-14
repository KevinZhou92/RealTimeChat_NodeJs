var socket = io();
var userName;
var userRoom;
var typing = false;
var lastTypingTime;
var INPUT_INTERVAL = 500; //ms

$('input[name=message]').on('input', function() {
  typingStatus();
});

function typingStatus() {
  var inputBox = $('#message');
  if (!typing) {
    typing = true;
    socket.emit('typing', {userName, userRoom});
  }
  lastTypingTime = (new Date()).getTime();
  setTimeout(function() {
    var currentTime = (new Date()).getTime();
    var diff = currentTime - lastTypingTime;
    if (diff >= INPUT_INTERVAL && typing) {
      typing = false;
      socket.emit('stop typing', {userName, userRoom});
    }
  }, INPUT_INTERVAL);
}

socket.on('typing', function(userName) {
  var template = $('#typing-template').html();
  var Info =  `${userName} is typing...`;
  var html = Mustache.render(template, {Info});
  $('#typingInfo').html(html);
});

socket.on('stop typing', function(userName) {
  var template = $('#typing-template').html();
  var Info = '';
  var html = Mustache.render(template, {Info});
  $('#typingInfo').html(html);
});

function scrollToBottom() {
  // Selectors
  var messages = $('#messages');
  var newMessage = messages.children('li:last-child');
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', function() {
  var userId = localStorage.getItem('user_id');
  var userToken = localStorage.getItem('user_token');
  var roomId = localStorage.getItem('room_id');
  var roomName = localStorage.getItem('room_name');
  var displayName = localStorage.getItem('display_name');

   $('#room_name').html(roomName);
   var params = {
     roomId,
     userToken,
     displayName
   }
  // join a room, list all the existing message, show online users;
  socket.emit('join', params, function(err) {
    if (err) {
      alert(err);
      window.location.href = '/index.html';
    }
  });
  userName = displayName;
  userRoom = roomId;
});

socket.on('disconnect', function() {
  console.log('Disconnect!');
});

socket.on('updateUserList', function(users) {
  var ol = $('<ol></ol>');

  users.forEach(function(user) {
    ol.append($('<li></li>').text(user));
  });
  $('#users').html(ol);
});

socket.on('newMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = $('#message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formattedTime
  });
  $('#messages').append(html);
  scrollToBottom();
  // $("#messages").scrollTop($("#messages")[0].scrollHeight);
  // var li = $('<li>></li>').text(`${message.from} ${formattedTime}: ${message.text}`);
  // $('#messages').append(li);
});

socket.on('newLocationMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
   var template = $('#location-template').html();
   var html = Mustache.render(template, {
     from: message.from,
     url: message.url,
     createdAt: formattedTime
   });
   $('#messages').append(html);
   scrollToBottom();
  // var li = $('<li></li>').text(`${message.from} ${formattedTime}: `);
  // var a = $('<a target="_blank">My current location</a>');
  // a.attr('href', message.url);
  // li.append(a);
  // $('#messages').append(li);
});

$('#message-form').on('submit', function(e) {
  e.preventDefault();

  var messageTextBox = $('[name=message]');
  socket.emit('createMessage', {
    from: 'User',
    text: messageTextBox.val()
  }, function(err) {
    if (err) {
      alert(err);
    }
    messageTextBox.val('');
  });
});

var locationButton = $('#send-location');
locationButton.on('click', function(e) {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending Location');

  navigator.geolocation.getCurrentPosition(function(position) {
      locationButton.removeAttr('disabled').text('Send Locatin');
      socket.emit('createLocationMessage', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
  }, function() {
    locationButton.removeAttr('disabled').text('Send Locatin');
    alert('Unable to fetch location.')
  });
});
