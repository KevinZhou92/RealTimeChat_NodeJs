var socket = io();

socket.on('connect', function() {
  console.log('Success!');
});

socket.emit('createEmail', {
    to: 'kevin@qq.com',
    text: 'hello server'
});

socket.on('disconnect', function() {
  console.log('Disconnect!');
});

socket.on('newMessage', function(newMessage) {
  console.log(newMessage);
});

socket.emit('creatdMessage', {
  from: 'Li meng',
  text: 'Tomorrow'
})


socket.on('newEmail', function(email) {
  console.log(email);
  console.log('New Email.');
});
