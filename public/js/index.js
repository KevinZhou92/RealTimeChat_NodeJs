var socket = io();

socket.on('connect', function() {
  console.log('Success!');
});

socket.on('disconnect', function() {
  console.log('Disconnect!');
});

socket.on('newMessage', function(newMessage) {
  console.log(newMessage);
});

socket.emit('createMessage', {
  from: 'Li meng',
  text: 'Tomorrow'
})
