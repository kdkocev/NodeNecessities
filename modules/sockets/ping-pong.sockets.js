var User = require("../../models/User");
module.exports = function (io, socket) {
  socket.currentGame = {
    players: [],
    ball: {
      x: 200,
      y: 200,
      speedX: 2.8,
      speedY: 2.3,
      size: 10
    },
    board: {
      w: 10,
      h: 100,
      speed: 10
    }
  };

  var containment = {
    minX: 0,
    maxX: 800,
    minY: 0,
    maxY: 400
  }

  var me = {};
  var opponent = {};

  // TODO: Run the game only from one of the sockets of the host

  User.find({
    "game.id": socket.user.game.id
  }, function (err, users) {
    for (user in users) {
      var player = {
        name: users[user].local.name,
        email: users[user].local.email,
        y: 150
      };
      if (users[user].local.email === socket.user.local.email) {
        player.isMe = true;
        me = users[user];
        me.i = user;
        socket.myIndex = user;
      } else {
        opponent = users[user];
        opponent.i = user;
      }

      socket.currentGame.players.push(player);
    }
    socket.emit("game:init", socket.currentGame);

    socket.on("moveUp", function (data) {
      socket.currentGame.players[socket.myIndex].y -= socket.currentGame.board.speed;
    });

    socket.on("moveDown", function (data) {
      socket.currentGame.players[socket.myIndex].y += socket.currentGame.board.speed;
    });

    // If the user is the host
    // if (me.local.email < opponent.local.email) {
    // change this please
    // Get sockets in the room and change it according to their x, y
    if (me.local.email == "admin@admin.com") {
      // Run the game 
      socket.currentGame.players[me.i].x = containment.minX + 20;
      socket.currentGame.players[opponent.i].x = containment.maxX - 20 - socket.currentGame.board.w;

      mainGameLoop();
    }

    function mainGameLoop() {
      moveBall();
      containBall();
      io.customTools.sendToUser(socket.currentGame.players[0].email, 'game:update', socket.currentGame);
      io.customTools.sendToUser(socket.currentGame.players[1].email, 'game:update', socket.currentGame);
      // TODO: think of a better way
      setTimeout(function () {
        mainGameLoop()
      }, 25);
    }

    function moveBall() {
      socket.currentGame.ball.x += socket.currentGame.ball.speedX;
      socket.currentGame.ball.y += socket.currentGame.ball.speedY;
    }

    function containBall() {
      if (socket.currentGame.ball.x + socket.currentGame.ball.size > containment.maxX || socket.currentGame.ball.x < containment.minX) {
        socket.currentGame.ball.speedX *= -1;
      }
      if (socket.currentGame.ball.y + socket.currentGame.ball.size > containment.maxY || socket.currentGame.ball.y < containment.minY) {
        socket.currentGame.ball.speedY *= -1;
      }
    }
  });
}