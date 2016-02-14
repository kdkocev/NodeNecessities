'use strict';
var User = require('../models/User');
var urls = require('../routes/urls');

let games = [];

module.exports = function (server) {
  var io = require('socket.io')(server);

  io.on("connection", function (socket) {
    function sendToUser(email, event, data) {
      var clients = getUserClients({
        local: {
          email: email
        }
      });
      for (let client in clients) {
        io.to(clients[client]).emit(event, data);
      }
    }
    io.to(socket.id).emit("connected");

    // Catch this one in the module if needed
    socket.on('disconnect', function () {});

    // Verification
    socket.on('handshake', function (token) {
      User.verifyToken(token, function (err, decoded) {
        if (err) {
          io.to(socket.id).emit('handshake', {
            success: false
          });
        } else {
          User.getUserByToken(token, function (user) {
            if (user == null) return;
            // Save the current user to this particular socket
            socket.user = user;
            // Complete the auth process
            io.to(socket.id).emit('handshake', {
              success: true
            });

            // require("./sockets/ping-pong.sockets.js")(io, socket, games);
            require("./sockets/stack-attack.sockets.js")(io, socket, games);
            require("./sockets/chat.sockets.js")(io, socket);


          });
        }
      });
    })

    io.customTools = {};

    io.customTools.sendToUser = function (email, event, data) {
      var clients = io.customTools.getUserClients({
        local: {
          email: email
        }
      });
      for (let client in clients) {
        io.to(clients[client]).emit(event, data);
      }
    }

    io.customTools.getUserClients = function (user) {
      return io.sockets.sockets.filter(function (x) {
        if (x.user)
          return x.user.local.email == user.local.email;
        else
          return false;
      }).map(function (x) {
        return x.id;
      });
    }

    io.customTools.getConnectedUsers = function () {
      return unique(io.sockets.sockets.map(function (x) {
        if (x.user) {
          return {
            name: x.user.local.name,
            email: x.user.local.email,
            avatar: urls.avatars_url + "/" + x.user.avatar
          };
        }
      }));
    }

    // The most elegant way to get the unique users
    function unique(arr) {
      var u = {},
        a = [];
      for (var i = 0, l = arr.length; i < l; ++i) {
        // Modified here with email
        if (arr[i] && !u.hasOwnProperty(arr[i].email)) {
          a.push(arr[i]);
          // And here
          u[arr[i].email] = 1;
        }
      }
      return a;
    }

  });
}