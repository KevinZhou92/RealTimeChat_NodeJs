var socket = io();

// jQuery Selectors
var sign_in_form = jQuery('#join-form');
var sign_up_form = jQuery('#sign-form');
var room_form = jQuery('#room-form');

var main_container = jQuery('#main-container');
var sign_up = jQuery('#sign_up');
var sign_in = jQuery('#sign_in');
var room_selector = jQuery('#room-selector');

var sign_out = jQuery('#sign_out');

socket.on('connect', function () {

  //Get room list
  socket.emit('getRoomList', function(roomList){
    if(roomList){
      localStorage.setItem('room_list', roomList);
    }
    //verify if user is logged in.
    if(localStorage.getItem('user_token') ){
      var token = localStorage.getItem('user_token');
      socket.emit('verifyUserByToken', {token}, function(err, user) {
        if (err) {
          localStorage.clear();
          alert('Invalid user! Please login again!');
          window.location.href = '/index.html';
        }
      });
      showRoomForm(localStorage.getItem('user_name'));
    }else{
      sign_in_form.removeClass('invisible');
    }
    main_container.removeClass('invisible');
  });
});

// switch to signup page
sign_up.on('click', function() {
  sign_in_form.addClass('invisible');
  sign_up_form.removeClass('invisible');
});

// submit register information
sign_up_form.on('submit', function(e) {
  e.preventDefault();

  var userName = $('input[name=s_name]').val();
  var userEmail = $('input[name=s_email]').val();
  var userPassword = $('input[name=s_password]').val();

  socket.emit('registerUser', {
    userName,
    userEmail,
    userPassword
  }, function(err, user, token) {
    if (err) {
      return alert(err);
    }
    ls_sign_in(user, token);
    showRoomForm(localStorage.getItem('user_name'));
    sign_up_form.addClass('invisible');
    alert('You have registered successfully!');
  });
});

// signin use existing user infomation
sign_in_form.on('submit', function(e) {
  e.preventDefault();

  var userEmail = $('input[name=email]').val();
  var userPassword = $('input[name=password]').val();

  socket.emit('login', {
    email: userEmail,
    password: userPassword
  }, function(err, user, token) {
    if (err) {
      return alert(err);
    }
    if (user) {
      ls_sign_in(user, token);
      showRoomForm(user.name);
      sign_in_form.addClass('invisible');
      alert('Welcome ' + user.name + ' you can start chatting now!');
    }
  });
});
// log out
sign_out.on('click', function() {
  socket.emit('logout', {
    token: localStorage.getItem('user_token'),
  }, function(e) {
    if (e) {
      return alert(e);
    }
    ls_sign_out();
    room_form.addClass('invisible');
    sign_in_form.removeClass('invisible');
    alert('You have successfuly signed out');
  });
});
// switch between forms
sign_in.on('click', function(e) {
  e.preventDefault();
  sign_in_form.removeClass('invisible');
  sign_up_form.addClass('invisible');
});
room_selector.on('change', function() {
  var value = room_selector.val();
  // list the new room input
  if (value == 1 ){
    $('#new-room').show();
  }
});
// submit room information
room_form.on('submit', function(e) {
  e.preventDefault();

  var room = $('input[name=roomName]').val();
  var displayName = $('#displayName').val();

  if (room_selector.val() != 1) {
    room = $( "#room-selector option:selected" ).text();
    socket.emit('getRoom', {roomName: room}, function(err, tempRoom) {
      if (err) {
        alert(err);
        window.location.href = '/index.html';
      }
      room = tempRoom;
      room.displayName = displayName;
      ls_room_info(room);
      alert(`Welcome back! ${localStorage.getItem('user_name')}`);
    });
  } else {
    if (!validString(room)) {
      return alert('Please provide a valid name!');
    }
    room = room.trim();
    socket.emit('newRoom', {roomName: room}, function(err, tempRoom) {
      if (err) {
        alert(err);
        window.location.href = '/index.html';
      } else {
        alert('Room created successfuly');
        room = tempRoom;
        room.displayName = displayName;
        ls_room_info(room);
      }
    });
  }
  window.location.href = '/chat.html';
});
// handle room list
function showRoomForm(userName) {
  var roomList = ['Select a room','Add a new room'];
  var roomObject = [];
  var template = jQuery('#rooms-template').html();

  //GET ROOM LIST
  if( localStorage.getItem('room_list') ){
    roomList = roomList.concat(localStorage.getItem('room_list').split(','));
  }
  for(idx in roomList){
    roomObject.push({index: idx, name: roomList[idx]});
  }
  var data = {
    rooms: roomObject,
  }
  var html = Mustache.render(template, data);
  jQuery('#room-selector').html(html);
  jQuery('#userName').html(userName);
  room_form.removeClass('invisible');
};
// localStorage
function ls_room_info(roomObject) {
  localStorage.setItem('display_name', roomObject.displayName);
  localStorage.setItem('room_id', roomObject._id.toString());
  localStorage.setItem('room_name', roomObject.name);
}
function ls_sign_in(user, token){
  localStorage.setItem('user_token', token);
  localStorage.setItem('user_name', user.name);
  localStorage.setItem('user_id', user._id);
};
function ls_sign_out(){
  let rl = localStorage.getItem('room_list');
  localStorage.clear();
  localStorage.setItem('room_list', rl);
};
function validString(str){
    str = str.trim();
    return typeof str === 'string' && str.length > 0 ? true : false;
}
