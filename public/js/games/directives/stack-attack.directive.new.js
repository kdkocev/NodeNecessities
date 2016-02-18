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
          scope.syncData = function (data) {
            window.objects[window.player1].setColumn(data.player[0].position.column);
          }
          $("canvas#stack-attack").attr("width", $(window).width() - 5);
          $("canvas#stack-attack").attr("height", $(window).height() - 5);

          window.objects = [];
          window.boxes = [];

          element.bind("keydown", function (e) {
            if (e.which === 13) {
              addBox();
            }

            if (e.which === 40) {
              box.position.row -= 1;
            }
            if (e.which === 38) {
              box.position.row += 1;
            }
            if (e.which === 37) {
              box.position.column -= 1;
              box.animationLimit.column = box.position.column;
            }
            if (e.which === 39) {
              box.position.column += 1;
              box.animationLimit.column = box.position.column;
            }
          })


          function addBox() {
            window.box = new Box();
            box.texture = Math.floor(random(0, window.textures.length));
            var x = 0;
            var y = 0;
            for (var i = textures[box.texture].length - 1; i >= 0; i--) {
              for (var j in textures[box.texture][i]) {
                if (textures[box.texture][i][j] == 1) {
                  var block = new Block(box);
                  block.setPosition(x, y);
                  objects.push(block);
                }
                x += blockW;
              }
              x = 0;
              y += blockH;
            }
            boxes.push(box);
            updateDrawingObjects(objects);
          }





          // Add boxes

          // for (var i = 0; i < 60; i++) {
          //   var box = new Box(0, 0);
          //   box.color = {
          //     r: random(0, 200),
          //     g: random(0, 200),
          //     b: random(0, 200)
          //   }
          //   box.position.setY(10);
          //   box.position.setX(10);
          //   objects.push(box);
          // }

          // for (var i = 0; i < objects.length; i++) {
          //   for (var j = 0; j < objects.length; j++) {
          //     if (i != j) {
          //       objects[i].colidesWith.push(objects[j])
          //     }
          //   }
          // }


          // // Add cranes
          // var crane = new Crane();
          // objects.push(crane);

          // var player = new Player();
          // for (var j = 0; j < objects.length; j++) {
          //   player.colidesWith.push(objects[j])
          // }
          // window.player1 = objects.push(player);

          // console.log(objects);

          // moveCrane(crane);
          // setInterval(function () {
          //   moveCrane(crane);
          // }, 8000);


          // Main game Loop
          var lastAnimation = 0;
          var animationDiff = 200;
          window.nextFrame = function (now) {
            drawFrame(now, objects,
              function (x) {
                // For Blocks

              },

              function () {
                // For objects
                if (now - lastAnimation > animationDiff) {
                  lastAnimation = now;
                  console.log("animate")
                  for (var i in boxes) {
                    boxes[i].fall();
                  }
                }
              });
          }



          // function movePlayer(direction) {
          //   console.log(objects)
          //   if (direction[1] > 0) {
          //     player.Jump()
          //   } else
          //   if (direction[0] < 0) {
          //     player.walkLeft();
          //   } else {
          //     player.walkRight();
          //   }
          // }

          // function startFalling(object) {
          //   object.startMovement({
          //     x: 0,
          //     y: -0.01
          //   });
          //   object.animationLimit.minY = -1;
          // }

          // function moveCrane(crane) {
          //   if (crane.noBox) {
          //     for (var i in objects) {
          //       if (objects[i].constructor.name !== "Box" || (objects[i].position.x <= 1 && objects[i].position.x >= -1)) continue;
          //       crane.takeBox(objects[i]);
          //       break;
          //     }
          //     var x = -0.01;
          //     if (crane.position.x < 0) {
          //       x *= -1;
          //     }
          //     crane.startMovement({
          //       x: x,
          //       y: 0
          //     });
          //   }
          // }


          // Start the game
          start(objects);
        }
      }
    })
})();