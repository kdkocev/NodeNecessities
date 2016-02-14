(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .directive("body", function (socket, $rootScope) {

      return {
        restrict: 'E',
        replace: false,
        scope: true,
        link: function (scope, element, attrs) {
          if ($("canvas").length > 0) {
            var c = document.getElementById("ping-pong");
            var ctx = c.getContext("2d");
            c.width = 800;
            c.height = 400;
            scope.fps = 0;
            scope.framesShown = 0;
            scope.seconds = 0;;

            scope.game = {};

            element.bind("keydown", function (e) {
              if (e.which === 40)
                socket.emit("game:move", {
                  direction: 1
                });
              if (e.which === 38)
                socket.emit("game:move", {
                  direction: -1
                });
            })

            scope.updateCanvas = function (cb) {
              if (!scope.game.ball) {
                return
              }
              ctx.fillStyle = "#000000";
              ctx.fillRect(0, 0, 800, 400);

              ctx.fillStyle = "#ffffff";
              ctx.fillRect(scope.game.ball.x * 800, scope.game.ball.y * 400, 20, 20);

              ctx.fillRect(scope.game.players[0].x * 800 - 20, scope.game.players[0].y * 400, 40, 0.4 * 400);
              ctx.fillRect(scope.game.players[1].x * 800 - 20, scope.game.players[1].y * 400, 40, 0.4 * 400);
              scope.framesShown++;
              cb();
            }

            scope.updateGame = function (cb1, cb2) {
              if (scope.game.ball.x < 0 || scope.game.ball.x > 1) {
                if (scope.game.ball.x < 0 && (scope.game.ball.y < scope.game.players[0].y || scope.game.ball.y > scope.game.players[0].y + scope.game.players[0].height)) {
                  scope.game.winner = scope.game.players[1];
                }
                if (scope.game.ball.x > 1 && (scope.game.ball.y < scope.game.players[1].y || scope.game.ball.y > scope.game.players[1].y + scope.game.players[1].height)) {
                  scope.game.winner = scope.game.players[0]
                }
                scope.game.ball.speedX *= -1;
              }
              if (scope.game.ball.y < 0 || scope.game.ball.y > 1) {
                scope.game.ball.speedY *= -1;
              }
              scope.game.ball.x += scope.game.ball.speedX;
              scope.game.ball.y += scope.game.ball.speedY;
              cb1(cb2);
            }

            scope.gameLoop = function () {
              if (!scope.game.ball) {
                setTimeout(() => {
                  scope.gameLoop()
                }, 500);
                return;
              }
              scope.updateGame(scope.updateCanvas, function () {
                if (!scope.game.winner) {
                  scope.gameLoop();
                } else {
                  alert(scope.game.winner.email + " WON THE GAME!!");
                  window.location = "/lobby";
                }
              });
            }

            scope.gameLoop();

            scope.syncData = function (data) {
              scope.game = data;
            }

            scope.userMoved = function (data) {
              scope.game.players = data.players;
            }

            setInterval(() => {
              scope.fps = scope.framesShown / scope.seconds;
              scope.seconds++;
            }, 1000);

          }
        }
      }
    })
})();