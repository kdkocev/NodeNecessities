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
          window.players = [];

          element.bind("keydown", function (e) {
            if (e.which === 13) {
              addBox();
              box.setColumn(6);
              box.setLimits(6, 0);
            }

            if (e.which === 40) {
              player.position.row -= 1;
              // box.position.row -= 1;
            }
            if (e.which === 38) {
              // player.position.row += 1;
              box.position.row += 1;
            }
            if (e.which === 37) {
              // player.position.column -= 1;
              // player.animationLimit.column = player.position.column;
              // console.log(player.position);
              box.position.column -= 1;
              box.animationLimit.column = box.position.column;
            }
            if (e.which === 39) {
              // player.position.column += 1;
              // player.animationLimit.column = player.position.column;
              // console.log(player.position);
              box.position.column += 1;
              box.animationLimit.column = box.position.column;
            }
            if (e.which === 192) { // `
              addPlayer();
            }
            if (e.which === 68) { //d
              movePlayerRight(player);
            }
            if (e.which === 65) { // a
              movePlayerLeft(player);
            }
            if (e.which === 82) { //r
              playerChangeTexture(player, 2);
            }
            if (e.which === 87) { //r
              player.jump();
            }
          })


          function addBox() {
            window.box = new Box();
            box.texture = Math.floor(random(0, window.boxTextures.length));
            var x = 0;
            var y = 0;
            for (var i = boxTextures[box.texture].length - 1; i >= 0; i--) {
              for (var j in boxTextures[box.texture][i]) {
                if (boxTextures[box.texture][i][j] == 1) {
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

          function addPlayer() {
            window.player = new Player();
            var x = 0;
            var y = 0;
            for (var i = playerTextures[player.texture].length - 1; i >= 0; i--) {
              for (var j in playerTextures[player.texture][i]) {
                if (playerTextures[player.texture][i][j] == 1) {
                  var block = new Block(player);
                  block.setPosition(x, y);
                  player.blocks.push(block);
                  objects.push(block);
                }
                x += blockW;
              }
              x = 0;
              y += blockH;
            }
            players.push(player);
            updateDrawingObjects(objects);
          }

          function movePlayerLeft(player) {

            // check if you can move left
            if (player.position.column === 0) return;

            // check if there is a box on the left
            var boxesOnTheLeft = boxes.filter(function (x) {
              return x.position.column === player.position.column - 1 && Math.round(x.position.row) === Math.round(player.position.row);
            });

            var boxOnTheLeft;
            if (boxesOnTheLeft.length > 0) {
              boxOnTheLeft = boxesOnTheLeft[0];
              // if this box is on the end it cannot be pushed
              if (boxOnTheLeft.position.column === 0) return;

              // check if this box has a box on the right or a box on top of this one
              var boxesOnTheLeft = boxes.filter(function (x) {
                return (x.position.column === boxOnTheLeft.position.column - 1 && x.position.row === boxOnTheLeft.position.row) || (x.position.column === boxOnTheLeft.position.column && x.position.row - 1 === boxOnTheLeft.position.row);
              });
              // if there are boxes on the right - it cannot be pushed
              if (boxesOnTheLeft.length > 0) {
                return;
              }

              // if this box has nothing undernieath it - it cannot be pushed
              var boxesUnderneath = boxes.filter(function (x) {
                return (x.position.column === boxOnTheLeft.position.column && x.position.row - 1 == boxOnTheLeft.position.row);
              });
              // if there are boxes on the right - it cannot be pushed
              if (boxesUnderneath.length === 0) {
                return;
              }
            }

            if (boxOnTheLeft) {
              boxOnTheLeft.animationLimit.column = Math.ceil(boxOnTheLeft.position.column - 1);
              boxOnTheLeft.animationsLeft = 4;
            }

            player.animationLimit.column = Math.ceil(player.position.column - 1);
            player.animationsLeft = 4;
          }

          function movePlayerRight(player) {

            // check if you can move right
            if (player.position.column === 11) return;

            // check if there is a box on the right
            var boxesOnTheRight = boxes.filter(function (x) {
              return x.position.column === player.position.column + 1 && Math.round(x.position.row) === Math.round(player.position.row);
            });

            var boxOnTheRight;
            if (boxesOnTheRight.length > 0) {
              boxOnTheRight = boxesOnTheRight[0];
              // if this box is on the end it cannot be pushed
              if (boxOnTheRight.position.column === 11) return;

              // check if this box has a box on the right or a box on the top or
              var boxesOnTheRight = boxes.filter(function (x) {
                return (x.position.column === boxOnTheRight.position.column + 1 && x.position.row === boxOnTheRight.position.row) || (x.position.column === boxOnTheRight.position.column && x.position.row - 1 === boxOnTheRight.position.row);
              });
              // if there are boxes on the right - it cannot be pushed
              if (boxesOnTheRight.length > 0) {
                return;
              }

              // if this box has nothing undernieath it - it cannot be pushed
              var boxesUnderneath = boxes.filter(function (x) {
                return (x.position.column === boxOnTheRight.position.column && x.position.row == boxOnTheRight.position.row - 1);
              });
              // if there are boxes on the right - it cannot be pushed
              if (boxesUnderneath.length === 0) {
                return;
              }
            }

            if (boxOnTheRight) {
              boxOnTheRight.animationLimit.column = Math.floor(boxOnTheRight.position.column + 1);
              boxOnTheRight.animationsLeft = 4;
            }

            player.animationLimit.column = Math.floor(player.position.column + 1);
            player.animationsLeft = 4;
          }

          function playerChangeTexture(player, texture) {
            player.texture = texture;
            //player.texture = Math.floor(random(0, playerTextures.length));
            var x = 0;
            var y = 0;
            var textureCounter = 0;
            for (var i = playerTextures[player.texture].length - 1; i >= 0; i--) {
              for (var j in playerTextures[player.texture][i]) {
                if (playerTextures[player.texture][i][j] == 1) {
                  if (textureCounter > player.blocks.length) {
                    var block = new Block(player);
                    player.blocks.push(block);
                    objects.push(block);
                  }
                  player.blocks[textureCounter].setPosition(x, y);

                  textureCounter++;
                }
                x += blockW;
              }
              x = 0;
              y += blockH;
            }
          }


          // Main game Loop
          var lastAnimation = 0;
          var animationDiff = 200;
          var playerIdleTextures = [
            PLAYER_IDLE_1,
            PLAYER_IDLE_1,
            PLAYER_IDLE_1,
            PLAYER_IDLE_1,
            PLAYER_IDLE_1,
            PLAYER_IDLE_2,
            PLAYER_IDLE_2,
            PLAYER_IDLE_3,
            PLAYER_IDLE_3,
            PLAYER_IDLE_1,
            PLAYER_IDLE_1,
            PLAYER_IDLE_1,
            PLAYER_IDLE_1,
            PLAYER_IDLE_1,
            PLAYER_IDLE_2,
            PLAYER_IDLE_2,
            PLAYER_IDLE_4,
            PLAYER_IDLE_4,
            PLAYER_IDLE_1
          ];

          window.nextFrame = function (now) {
            drawFrame(now, objects,
              function (x) {
                // For Blocks

              },

              function () {
                // For objects
                if (now - lastAnimation > animationDiff) {
                  lastAnimation = now;
                  for (var i in boxes) {
                    boxes[i].fall();
                  }
                  for (var i in players) {
                    players[i].fall();

                    // change player textures
                    var texture = playerIdleTextures[0];
                    playerIdleTextures.push(playerIdleTextures.shift());
                    playerChangeTexture(players[i], texture)
                  }
                }
              });
          }


          // Start the game
          start(objects);
        }
      }
    })
})();