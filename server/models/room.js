const mongoose = require('mongoose');

var roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  messages: [{
    content: {
      type: String
    },
    url: {
      type: String
    },
    from: {
      type: String,
      required: true
    },
    createdAt: {
      type: Number,
      required: true
    },
    roomId: {
      type: String,
      required: true
    },
    alias: {
      type: String,
      required: true
    }
  }]
},{
  usePushEach: true
});
roomSchema.statics.getRoomList = function() {
  var Room = this;
  var roomList;
  return Room.find({}).then((rooms) => {
      roomList = rooms.map((room) => room.name);
      return roomList;
  }).catch((err) => console.log(err));
};
var Room = mongoose.model('Room', roomSchema);
module.exports = {Room};
