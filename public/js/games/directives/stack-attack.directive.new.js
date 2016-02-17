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
              movePlayer([0, -1])
              //startFalling(objects[0]);
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


          var objects = [];

          // Add boxes
          for (var i = 0; i < 60; i++) {
            var box = new Box(0, 0);
            box.color = {
              r: random(0, 200),
              g: random(0, 200),
              b: random(0, 200)
            }
            box.position.setY(10);
            box.position.setX(10);
            objects.push(box);
          }

          for (var i = 0; i < objects.length; i++) {
            for (var j = 0; j < objects.length; j++) {
              if (i != j) {
                objects[i].colidesWith.push(objects[j])
              }
            }
          }


          // Add cranes
          var crane = new Crane();
          objects.push(crane);

          var player = new Player();
          for (var j = 0; j < objects.length; j++) {
            player.colidesWith.push(objects[j])
          }
          objects.push(player);

          console.log(objects);

          moveCrane(crane);
          setInterval(function () {
            moveCrane(crane);
          }, 8000);


          // Main game Loop
          window.nextFrame = function (now) {
            drawFrame(now, objects, function (x) {
              x.move()
            });
          }



          function movePlayer(direction) {
            console.log(objects)
            if (direction[1] > 0) {
              player.Jump()
            } else
            if (direction[0] < 0) {
              player.walkLeft();
            } else {
              player.walkRight();
            }
          }

          function startFalling(object) {
            object.startMovement({
              x: 0,
              y: -0.01
            });
            object.animationLimit.minY = -1;
          }

          function moveCrane(crane) {
            if (crane.noBox) {
              for (var i in objects) {
                if (objects[i].constructor.name !== "Box" || (objects[i].position.x <= 1 && objects[i].position.x >= -1)) continue;
                crane.takeBox(objects[i]);
                break;
              }
              var x = -0.01;
              if (crane.position.x < 0) {
                x *= -1;
              }
              crane.startMovement({
                x: x,
                y: 0
              });
            }
          }


          // Start the game
          start(objects);
        }
      }
    })
})();