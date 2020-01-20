const expect = require('expect');

const {UsersList} = require('./usersList.js');

describe('Users', () => {
  var users;

  beforeEach(() => {
    users = new UsersList();
    users.users = [{
      id: '1',
      name: 'Mike',
      displayName: 'Mike',
      roomId: 'Node Course'
    }, {
      id: '2',
      name: 'Jen',
      displayName: 'Jen',
      roomId: 'React Course'
    }, {
      id: '3',
      name: 'Julie',
      displayName: 'Julie',
      roomId: 'Node Course'
    }];
  });

  it('should add new user', () => {
    var users = new UsersList();
    var user = {
      id: '123',
      displayName: 'Andrew',
      userName: 'Andrew',
      roomId: 'The Office Fans'
    };
    var resUser = users.addUser(user.id, user.displayName, user.roomId, user.userName);

    expect(users.users).toEqual([user]);
  });

  it('should remove a user', () => {
    var userId = '1';
    var user = users.removeUser(userId);
    
    expect(user.id).toBe(userId);
    expect(users.users.length).toBe(2);
  });

  it('should not remove user', () => {
    var userId = '99';
    var user = users.removeUser(userId);

    expect(user).toNotExist();
    expect(users.users.length).toBe(3);
  });

  it('should find user', () => {
    var userId = '2';
    var user = users.getUser(userId);

    expect(user.id).toBe(userId);
  });

  it('should not find user', () => {
    var userId = '99';
    var user = users.getUser(userId);

    expect(user).toNotExist();
  });

  it('should return names for node course', () => {
    var userList = users.getUserList('Node Course');

    expect(userList).toEqual(['Mike', 'Julie']);
  });

  it('should return names for react course', () => {
    var userList = users.getUserList('React Course');

    expect(userList).toEqual(['Jen']);
  });

  it('should remove user by name', () => {
    var removedUser = users.removeUserByName('Jen', 'React Course');

    expect(removedUser.name).toBe('Jen');
    expect(removedUser.id).toBe('2');
    expect(users.users.length).toBe(2);
  });
});
