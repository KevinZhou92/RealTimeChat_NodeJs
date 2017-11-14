[{
  id: '/adf14',
  name: 'Andrew',
  roomId: 'The Office Fans'
}]

// addUser(id, name, roomId)
// removerUser(id)
// getUser(id)
// gerUserList(roomId)

class UsersList {
  constructor() {
    this.users = [];
  }
  addUser(id, displayName, roomId, userName) {
    var user = {id, displayName, roomId, userName};
    this.users.push(user);
    return user;
  }
  removeUser(id) {
    // return user removed
    var user = this.getUser(id);
    if (user) {
      this.users = this.users.filter((user) => user.id !== id);
    }
    return user;
  }
  removeUserByName(name, roomId) {
    var users = this.getUserList(roomId);
    var user = this.users.filter((user) => user.dsiplayName === name)[0];
    if (user) {
      this.users = this.users.filter((user) => user.displayName !== name);
    }

    return user;
  }
  getUser(id) {
    var user = this.users.filter((user) => user.id === id)[0];
    return user;
  }
  getUserList(roomId) {
    var users = this.users.filter((user) => user.roomId === roomId);
    var nameArray = users.map((user) => user.displayName);
    return nameArray;
  }
}

module.exports = {UsersList};
