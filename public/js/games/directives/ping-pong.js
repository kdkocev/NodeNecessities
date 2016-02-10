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

            element.bind("keydown", function (e) {
              if (e.which === 40)
                socket.emit("moveDown");
              if (e.which === 38)
                socket.emit("moveUp");
            })

            scope.updateCanvas = function (data) {
              // TODO: Dont use static values
              ctx.fillStyle = "#000000";
              ctx.fillRect(0, 0, 800, 400);

              ctx.fillStyle = "#ffffff";
              ctx.fillRect(data.ball.x, data.ball.y, data.ball.size, data.ball.size);

              ctx.fillRect(data.players[0].x, data.players[0].y, data.board.w, data.board.h);
              ctx.fillRect(data.players[1].x, data.players[1].y, data.board.w, data.board.h);
            }

          }
        }
      }
    })
})();