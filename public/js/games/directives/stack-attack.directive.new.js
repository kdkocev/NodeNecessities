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
          scope.score = 0;
          $("canvas#stack-attack").attr("width", $(window).width() - 5);
          $("canvas#stack-attack").attr("height", $(window).height() - 5);

          element.bind("keydown", function (e) {
            if (e.which === 40) {
              // movePlayer([0, -1])
              startFalling(objects[0]);
            }
            if (e.which === 38) {
              movePlayer([0, 1])
            }
            if (e.which === 37) {
              movePlayer([-1, 0])
              // console.log("left")
            }
            if (e.which === 39) {
              movePlayer([1, 0])
              // console.log("right");
            }
          })


          window.objects = [];


          for (var i = 0; i < 5; i++) {
            var box = new Box(0, 0);
            box.color = {
              r: random(0, 255),
              g: random(0, 255),
              b: random(0, 255)
            }
            box.position.setColumn(Math.floor(random(0, 12)));
            box.position.setRow(Math.floor(random(0, 5)))
            box.setLimits(-1, 1, -1, 1);
            objects.push(box);
          }

          window.nextFrame = function (now) {
            drawFrame(now, objects, function (x) {
              x.move()
            });
          }

          function movePlayer(direction) {
            console.log(objects)
            var speed = {
              x: 0.01 * direction[0],
              y: 0.01 * direction[1]
            }
            objects[0].startMovement(speed);
          }

          function startFalling(object) {
            object.startMovement({
              x: 0,
              y: -0.01
            });
            object.animationLimit.minY = -1;
          }


          start(objects);
        }
      }
    })
})();