const expect = require('expect');
var {generateMessage, generateLocationMessage} = require('./message');

describe('generateMessage', () => {
  it('should generate a message', () => {
    var from = 'kevin';
    var text = 'this is a message.';
    var message = generateMessage(from, text);
    expect(message).toInclude({from, text});
  });

  it('should generate a url', () => {
    var from = 'admin';
    var latitude = 40;
    var longitude = 80;
    var url = 'https://www.google.com/maps?q=40,80';
    var locationMessage = generateLocationMessage(from, latitude, longitude);
    expect(locationMessage.createdAt).toBeA('number');
    expect(locationMessage).toInclude({from, url});
  });

});
