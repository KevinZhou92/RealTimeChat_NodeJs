var socket = io();

socket.on('connect', function() {
  console.log('Success!');
});

socket.on('disconnect', function() {
  console.log('Disconnect!');
});

socket.on('newMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var li = $('<li>></li>').text(`${message.from} ${formattedTime}: ${message.text}`);
  $('#messages').append(li);
});

socket.on('newLocationMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var li = $('<li></li>').text(`${message.from} ${formattedTime}: `);
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
