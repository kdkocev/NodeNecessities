var User = require('../models/User');
var urls = require('../routes/urls');

module.exports = function (server) {
  var io = require('socket.io')(server);

  io.on("connection", function (socket) {
    io.to(socket.id).emit("connected");

    socket.on('disconnect', function () {
      var connectedUsers = getConnectedUsers();
      socket.broadcast.emit('user:join', connectedUsers);
      socket.emit('user:join', connectedUsers);
    });

    socket.on('handshake', function (token) {
      User.verifyToken(token, function (err, decoded) {
        if (err)
          console.log(err);
        else {
          User.getUserByToken(token, function (user) {
            if (user == null) return;
            console.log("User entered: ", user.local.email);

            // save user
            socket.user = user;
            // TODO: modify
            io.to(socket.id).emit('handshake', {
              user: {
                email: user.local.email
              },
              success: true
            });
            var connectedUsers = getConnectedUsers();
            socket.broadcast.emit('user:join', connectedUsers);
            socket.emit('user:join', connectedUsers);
          });

        }
      });
    })

    // TODO: send the message to a recepient
    socket.on('message', function (message) {
      console.log(message);
      var date = new Date();
      message.time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      socket.broadcast.emit('message', message);
      socket.emit('message:sent', message.time);
    })
  });

  // A functional filter for Objects. The object is passed as parameter
  Object.filter = function (obj, predicate) {
    var result = {},
      key;

    for (key in obj) {
      if (obj.hasOwnProperty(key) && predicate(obj[key])) {
        result[key] = obj[key];
      }
    }

    return result;
  };

  function getUserClients(user) {
    return io.sockets.sockets.filter(function (x) {
      if (x.user)
        return x.user.local.email == user.local.email;
      else
        return false;
    }).map(function (x) {
      return x.id;
    });
  }

  function getConnectedUsers() {
    try {
      return unique(io.sockets.sockets.map(function (x) {
        return {
          name: x.user.local.name,
          email: x.user.local.email,
          avatar: urls.avatars_url + "/" + x.user.avatar
        };
      }));
    } catch (e) {
      console.log(e)
    };
  }

  // The most elegant way to get the unique users
  function unique(arr) {
    var u = {},
      a = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
      // Modified here with email
      if (!u.hasOwnProperty(arr[i].email)) {
        a.push(arr[i]);
        // And here
        u[arr[i].email] = 1;
      }
    }
    return a;
  }


  // Now we can type commands directly into the terminal
  // when we want to interact with our app
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  var util = require('util');

  process.stdin.on('data', function (text) {
    util.inspect(text);

    // send to <email> <message>
    // or
    // send <message>

    if (text.indexOf("send ") == 0) {
      text = text.substring(5);
      if (text.indexOf("to ") == 0) {
        text = text.substring(3);
        var reciever = text.substring(0, text.indexOf(" "));
        var message = text.substring(text.indexOf(" "));
        var recieverClients = getUserClients({
          local: {
            email: reciever
          }
        });
        console.log("Should have: ", reciever, message, recieverClients);
        var x;
        for (x in recieverClients) {
          io.to(recieverClients[x]).emit("message", message);
        }
      } else {
        io.sockets.emit("message", "Admin: " + text);
      }
    }

    // show users

    if (text.indexOf("show ") == 0) {
      text = text.substring(5);
      if (text.indexOf("users") == 0) {
        console.log(getConnectedUsers());
      }
    }
  });
}