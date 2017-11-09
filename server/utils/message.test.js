const expect = require('expect');
var {generateMessage} = require('./message');

describe('generateMessage', () => {
  it('should generate a message', () => {
    var from = 'kevin';
    var text = 'this is a message.';
    var message = generateMessage(from, text);
    expect(message).toInclude({from, text});
  });
})
