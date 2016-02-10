var User = require('../../models/User');

// called when the handshake was successful
module.exports = function (io, socket) {

  io.gameInvitations = [];

  console.log("chat.socket.js");

  broadcastUserJoin();

  socket.on('disconnect', () => {
    broadcastUserJoin();
  });


  socket.on('message', message => {
    // Set the message timestamp
    message.time = formatDate(new Date());
    socket.broadcast.emit('message', message);
    socket.emit('message:recieved', message.time);
  })

  socket.on("user:inviteToGame", users => {

    var clients = io.customTools.getUserClients({
      local: {
        email: users.receiver.email
      }
    });
    User.randomString(10, str => {
      var game = {
        id: str,
        sender: users.sender
      };
      io.gameInvitations.push(game);
      // TODO: make this in a function
      for (client in clients) {
        io.to(clients[client]).emit("user:invitedYouToGame", game);
      }
    });
  });

  socket.on('user:acceptGame', game => {
    console.log("game accepted");
    var exactGame = io.gameInvitations.filter(x => x.id === game.id)[0];
    console.log(exactGame);

    var users = [];
    users.push(exactGame.sender.email);
    users.push(socket.user.local.email);

    User.startGame(exactGame.id, users, () => {

      io.customTools.sendToUser(users[0], 'user:getInGame', game);
      io.customTools.sendToUser(users[1], 'user:getInGame', game);
    });


    // remove game from queue of unaccepted io.gameInvitations
    io.gameInvitations = io.gameInvitations.filter(x => x.id !== game.id);
  });

  socket.on('user:refuseGame', function (game) {
    console.log("game refused");
    io.gameInvitations = io.gameInvitations.filter(function (x) {
      return x.id !== game.id;
    });
    // TODO: make this in a function
    var clients = io.customTools.getUserClients({
      local: {
        email: game.sender.email
      }
    });
    for (client in clients) {
      io.to(clients[client]).emit("user:invitationRefused", game);
    }
  });


  function broadcastUserJoin() {
    var connectedUsers = io.customTools.getConnectedUsers();
    console.log("Connected users", connectedUsers);
    socket.broadcast.emit('user:join', connectedUsers);
    socket.emit('user:join', connectedUsers);
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




  // Now we can type commands directly into the terminal
  // when we want to interact with our app
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  var util = require('util');

  process.stdin.on('data', function (text) {
    util.inspect(text);

    if (text.indexOf("get games") == 0) {
      console.log(io.gameInvitations);
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
        var recieverClients = io.customTools.getUserClients({
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
        console.log(io.customTools.getConnectedUsers());
      }
    }
  });
}

function formatDate(date) {
  return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}