'use strict';

var User = require("../../models/User");
module.exports = function (io, socket, games) {

  if (!socket.user.game.id) {
    return;
  }

  console.log("User that is in gaming: ", socket.user)

  if (typeof games[socket.user.game.id] === 'undefined') {
    games[socket.user.game.id] = {
      id: socket.user.game.id,
      players: [{
        position: {
          column: 0,
          row: 0
        }
      }, {
        column: 0,
        row: 3
      }],
      boxes: [{
        column: 1,
        row: 1
      }],
      cranes: []
    }
    process.nextTick(() => {
      startGame(games[socket.user.game.id])
    });
  }

  function startGame(game) {
    game.playersEmails = [];
    let k = 0;
    User.find({
      "game.id": socket.user.game.id
    }, function (err, users) {
      for (let i in users) {
        game.playersEmails.push(users[i].local.email)
        game.players[k++].email = users[i].local.email;
      }
      gameLoop(game);
    });
  }

  function gameLoop(game) {
    updateUsers(game, updateGame, (game) => {
      if (!game.winner) {
        setTimeout(() => {
          gameLoop(game)
        }, 1000);
      }
    });
  }


  // Sending "game" object to the users
  function updateUsers(game, cb, cb2) {
    for (let email in game.playersEmails) {
      io.customTools.sendToUser(game.playersEmails[email], 'game:update', game);
    }
    cb(game, cb2)
  }

  // Game logic here 
  var i = 0;

  function updateGame(game, cb) {
    cb(game)
  }

  // TODO: remake with using less requests
  socket.on("game:move", function (data) {
    // Who is the player?
    // let i = 0;
    // if (socket.user.local.email === games[socket.user.game.id].players[0].email) {
    //   i = 1;
    // }


    // Send feedback to the other player
    // for (let email in games[socket.user.game.id].playersEmails) {
    //   io.customTools.sendToUser(games[socket.user.game.id].playersEmails[email], 'game:playerMove', games[socket.user.game.id]);
    // }

  });
}