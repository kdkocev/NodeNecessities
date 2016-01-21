var User = require('../models/User');
var urls = require('../routes/urls');

module.exports = function (server) {
  var io = require('socket.io')(server);
  var games = [];

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
            // Forgive me father, for I have sinned
            // TODO: fix
            setTimeout(function () {
              var connectedUsers = getConnectedUsers();
              socket.broadcast.emit('user:join', connectedUsers);
              socket.emit('user:join', connectedUsers);
            }, 1000);
          });

        }
      });
    })

    socket.on('message', function (message) {
      console.log(message);
      var date = new Date();
      message.time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      socket.broadcast.emit('message', message);
      socket.emit('message:sent', message.time);
    })

    socket.on("user:inviteToGame", function (users) {

      var clients = getUserClients({
        local: {
          email: users.receiver.email
        }
      });
      User.randomString(10, function (str) {
        var game = {
          id: str,
          sender: users.sender
        };
        games.push(game);
        // TODO: make this in a function
        for (client in clients) {
          io.to(clients[client]).emit("user:invitedYouToGame", game);
        }
      });
    });

    socket.on('user:acceptGame', function (game) {
      console.log("game accepted");
      var exactGame = games.filter(function (x) {
        return x.id === game.id;
      })[0];
      console.log(exactGame);

      var users = [];
      users.push(exactGame.sender.email);
      users.push(socket.user.local.email);

      User.startGame(exactGame.id, users, function () {

        sendToUser(users[0], 'user:getInGame', game);
        sendToUser(users[1], 'user:getInGame', game);
      });


      // remove game from queue of unaccepted games
      games = games.filter(function (x) {
        return x.id !== game.id;
      });
    });

    socket.on('user:refuseGame', function (game) {
      console.log("game refused");
      games = games.filter(function (x) {
        return x.id !== game.id;
      });
      // TODO: make this in a function
      var clients = getUserClients({
        local: {
          email: game.sender.email
        }
      });
      for (client in clients) {
        io.to(clients[client]).emit("user:invitationRefused", game);
      }
    });

    // Tests for the game
    // Should be moved elswhere

    socket.on('move', function (data) {
      var command = {
        speed: 10,
        directionX: 0,
        directionY: 0
      };
      console.log(data);
      if (data.key === 38) {
        command.directionY = -1;
      }
      if (data.key === 40) {
        command.directionY = 1;
      }
      if (data.key == 37) {
        command.directionX = -1;
      }
      if (data.key == 39) {
        command.directionX = 1;
      }
      if (command.directionX == 0 && command.directionY == 0) return;
      console.log(command);
      socket.broadcast.emit("move", command);
      socket.emit("move", command);
    });

  });

  function sendToUser(email, event, data) {
    var clients = getUserClients({
      local: {
        email: email
      }
    });
    for (client in clients) {
      io.to(clients[client]).emit(event, data);
    }
  }


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


  // Now we can type commands directly into the terminal
  // when we want to interact with our app
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  var util = require('util');

  process.stdin.on('data', function (text) {
    util.inspect(text);

    if (text.indexOf("get games") == 0) {
      console.log(games);
    }

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