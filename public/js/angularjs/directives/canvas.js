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
            element.bind("keydown", function (e) {
              socket.emit("move", {
                type: "keydown",
                key: e.which
              });
            })

            element.bind("keyup", function (e) {
              socket.emit("move", {
                type: "keyup",
                key: e.which
              })
            })

            var c = document.getElementById("game");
            var ctx = c.getContext("2d");
            c.width = $(window).width();
            c.height = $(window).height();
            ctx.moveTo(0, 0);
            ctx.lineTo(200, 200);
            ctx.stroke();

            var x = 200;
            var y = 200;

            socket.on("move", function (command) {
              console.log(command);
              x += command.speed * command.directionX;
              y += command.speed * command.directionY;
              console.log(x, y);
              ctx.lineTo(x, y);
              ctx.stroke();
            });
          }
        }
      }
    })
})();