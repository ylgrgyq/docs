require('coffee-script/register')
var app = require('./app.coffee');

var PORT = parseInt(process.env.PORT || 3001);
var server = app.listen(PORT, function () {
  console.log('Node app is running, port:', PORT);
});
