var jwt = require('jsonwebtoken');
var jwt_secret = require('../config/config.js').jwt_secret;
var User = require('../models/User.js');

module.exports = function(server){
  var io = require('socket.io')(server);
  io.on("connection", function(socket){
      socket.on('event', function(data){console.log(data);});
      socket.on('disconnect', function(data){
        
      });
      socket.on('handshake',function(token){
        jwt.verify(token, jwt_secret, function(err, decoded) {
          if(err)
            console.log(err);
          else{
            io.emit('handshake',{success:true});
          }
        });
        //console.log(io.sockets.connected);
      })
  });
}