const express = require('express');
const path = require('path');
const publicPath = path.join(__dirname, '../public' )
const fs = require('fs');

const port = process.env.PORT || 8080;
var app = express();

app.use('/', (req, res, next) => {
  var visitLog = [
    new Date(),
    req.method,
    req.url,
    req.ip
  ].join(' ');
  fs.appendFile('server.log', visitLog + '\n', (err) => {
    console.log('success');
    if (err) {
      console.log('Unable to log the user!');
    }
  });
  next();
});
app.use(express.static(publicPath));


app.get('/', (req, res) => {

});

app.listen(port, () => {
  console.log(`Starting listening on port 8080...`);
});
