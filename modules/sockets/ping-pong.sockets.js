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
        x: 0,
        y: 0.3,
        height: 0.4
      }, {
        x: 1,
        y: 0.3,
        height: 0.4
      }],
      ball: {
        x: 0.5,
        y: 0.5,
        speedX: 0.01,
        speedY: 0
      },
      winner: null
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
        io.customTools.sendToUser(users[i].local.email, 'game:start', game);
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

  function updateUsers(game, cb, cb2) {
    for (let email in game.playersEmails) {
      io.customTools.sendToUser(game.playersEmails[email], 'game:update', game);
    }
    cb(game, cb2)
  }

  function updateGame(game, cb) {
    for (let i = 0; i < 20; i++) {
      if (game.ball.x < 0 || game.ball.x > 1) {
        if (game.ball.x < 0 && (game.ball.y < game.players[0].y || game.ball.y > game.players[0].y + game.players[0].height)) {
          game.winner = game.players[1];
        }
        if (game.ball.x > 1 && (game.ball.y < game.players[1].y || game.ball.y > game.players[1].y + game.players[1].height)) {
          game.winner = game.players[0];
        }
        game.ball.speedX *= -1;
      }
      if (game.ball.y < 0 || game.ball.y > 1) {
        game.ball.speedY *= -1;
      }
      game.ball.x += game.ball.speedX;
      game.ball.y += game.ball.speedY;
    }
    cb(game)
  }

  // TODO: remake with using less requests
  socket.on("game:move", function (data) {
    let i = 0;
    if (socket.user.local.email === games[socket.user.game.id].players[0].email) {
      i = 1;
    }

    if (data.direction == 1) {
      if (games[socket.user.game.id].players[i].y > 0 || games[socket.user.game.id].players[i].y < 1) {
        games[socket.user.game.id].players[i].y += 0.05;
      }
    }

    if (data.direction == -1) {
      if (games[socket.user.game.id].players[i].y > 0 || games[socket.user.game.id].players[i].y < 1) {
        games[socket.user.game.id].players[i].y -= 0.05;
      }
    }

    for (let email in games[socket.user.game.id].playersEmails) {
      io.customTools.sendToUser(games[socket.user.game.id].playersEmails[email], 'game:playerMove', games[socket.user.game.id]);
    }

  });
}