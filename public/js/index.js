var socket = io();

socket.on('connect', function() {
  console.log('Success!');
});

socket.on('disconnect', function() {
  console.log('Disconnect!');
});

socket.on('newMessage', function(message) {
  console.log(message);
  var li = $('<li>></li>').text(`${message.from}: ${message.text}`);
  $('#messages').append(li);
});

socket.on('newLocationMessage', function(message) {
  console.log(message);
  var li = $('<li>></li>').text(`${message.from}: `);
  var a = $('<a target="_blank">My current location</a>');
  a.attr('href', message.url);
  li.append(a);
  $('#messages').append(li);
});

$('#message-form').on('submit', function(e) {
  e.preventDefault();

  var messageTextBox = $('[name=message]');
  socket.emit('createMessage', {
    from: 'User',
    text: messageTextBox.val()
  }, function() {
    messageTextBox.val('');
  });
});

var locationButton = $('#send-location');
locationButton.on('click', function(e) {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }
  navigator.geolocation.getCurrentPosition(function(position) {
      socket.emit('createLocationMessage', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })
  }, function() {
    alert('Unable to fetch location.')
  });
});
