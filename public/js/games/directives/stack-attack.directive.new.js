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


          window.addFloorTexture = function () {
            var x = 0;
            var y = 0;
            var box = new Box();
            box.position.row = -0.5;
            for (var o = 0; o < 30; o++) {
              y = 0;
              for (var i = floorTexture.length - 1; i >= 0; i--) {
                for (var j = 0; j < floorTexture[i].length; j++) {
                  if (floorTexture[i][j] == 1) {
                    var block = new Block(box);
                    block.setPosition(x, y);
                    objects.push(block);
                  }
                  x += blockW;
                }
                x = 0 + o * 4 * blockW;
                y += blockH;
              }
            }
            updateDrawingObjects(objects);
          }

          window.addRoofTexture = function () {
            var x = 0;
            var y = 0;
            var box = new Box();
            box.position.row = 7;
            for (var o = 0; o < 30; o++) {
              y = 0;
              for (var i = roofTexture.length - 1; i >= 0; i--) {
                for (var j = 0; j < roofTexture[i].length; j++) {
                  if (roofTexture[i][j] == 1) {
                    var block = new Block(box);
                    block.setPosition(x, y);
                    objects.push(block);
                  }
                  x += blockW;
                }
                x = 0 + o * 4 * blockW;
                y += blockH;
              }
            }
            updateDrawingObjects(objects);
          }

          window.addWallTexture = function () {
            var x = 0;
            var y = 0;
            var box = new Box();
            box.position.row = -0.5;
            box.position.column = -0.5;
            for (var o = 0; o < 30; o++) {
              y = o * 4 * blockH;
              for (var i = wallTexture.length - 1; i >= 0; i--) {
                for (var j = 0; j < wallTexture[i].length; j++) {
                  if (wallTexture[i][j] == 1) {
                    var block = new Block(box);
                    block.setPosition(x, y);
                    objects.push(block);
                  }
                  x += blockW;
                }
                x = 0;
                y += blockH;
              }
            }
            updateDrawingObjects(objects);
          }

          window.addBackgroundTexture = function () {
            var x = 0;
            var y = 0;
            var box = new Box();
            box.position.row = 3;
            for (var o = 0; o < 30; o++) {
              y = 0;
              for (var i = backgroundTexture.length - 1; i >= 0; i--) {
                for (var j = 0; j < backgroundTexture[i].length; j++) {
                  if (backgroundTexture[i][j] == 1) {
                    var block = new Block(box);
                    block.setPosition(x, y);
                    objects.push(block);
                  }
                  x += blockW;
                }
                x = 0 + o * 8 * blockW;
                y += blockH;
              }
            }
            updateDrawingObjects(objects);
          }


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

              // check if this box has a box on the left or a box on top of this one
              var boxesOnTheLeft = boxes.filter(function (x) {
                return (x.position.column === boxOnTheLeft.position.column - 1 && x.position.row === boxOnTheLeft.position.row) || (x.position.column === boxOnTheLeft.position.column && x.position.row - 1 === boxOnTheLeft.position.row);
              });
              // if there are boxes on the left - it cannot be pushed
              if (boxesOnTheLeft.length > 0) {
                return;
              }

              // if this box has nothing undernieath it - it cannot be pushed
              // if (boxOnTheLeft.position.row !== 0) {
              //   var boxesUnderneath = boxes.filter(function (x) {
              //     return (x.position.column === boxOnTheLeft.position.column && x.position.row - 1 == boxOnTheLeft.position.row);
              //   });
              //   // if there are boxes on the right - it cannot be pushed
              //   if (boxesUnderneath.length === 0) {
              //     return;
              //   }
              // }
            }

            // if there is a box / floor to walk on(if there is no box underneath the player)
            // fixes a bug with flying
            // if (player.position.row !== 0) {
            //   var boxesToWalkOn = boxes.filter(function (x) {
            //     return (x.position.row === player.position.row - 1 && x.position.column === player.position.column) || (x.position.row - 1 === player.position.row) && (x.position.column - 1 === player.position.column);
            //   })
            //   if (boxesToWalkOn.length === 0) {
            //     return;
            //   }
            // }

            if (boxOnTheLeft) {
              boxOnTheLeft.animationLimit.column = Math.ceil(boxOnTheLeft.position.column - 1);
              boxOnTheLeft.animationsLeft = 4;
              window.currentPlayerTexture = 3;
            } else {
              window.currentPlayerTexture = 1;
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
              if (boxOnTheRight.position.row !== 0) {
                var boxesUnderneath = boxes.filter(function (x) {
                  return (x.position.column === boxOnTheRight.position.column && x.position.row == boxOnTheRight.position.row - 1);
                });
                if (boxesUnderneath.length === 0) {
                  return;
                }
              }
            }

            // if there are boxes on the right - it cannot be pushed
            // if there is a box/floor to walk on
            // if (player.position.row !== 0) {
            //   var boxesToWalkOn = boxes.filter(function (x) {
            //     return (x.position.row + 1 === player.position.row) && (x.position.column - 1 === player.position.column);
            //   })
            //   if (boxesToWalkOn.length === 0) {
            //     return;
            //   }
            // }

            if (boxOnTheRight) {
              boxOnTheRight.animationLimit.column = Math.floor(boxOnTheRight.position.column + 1);
              boxOnTheRight.animationsLeft = 4;
              window.currentPlayerTexture = 4;
            } else {
              window.currentPlayerTexture = 2;
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
            while (textureCounter < player.blocks.length) {
              player.blocks[textureCounter].setPosition(10, 10);
              textureCounter++;
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

          var playerWalkLeft = [
            PLAYER_WALK_LEFT_1,
            PLAYER_WALK_LEFT_2
          ]

          var playerWalkRight = [
            PLAYER_WALK_RIGHT_1,
            PLAYER_WALK_RIGHT_2
          ]

          var playerPushLeft = [
            PLAYER_PUSH_LEFT_1,
            PLAYER_PUSH_LEFT_2,
            PLAYER_PUSH_LEFT_3
          ]

          var playerPushRight = [
            PLAYER_PUSH_RIGHT_1,
            PLAYER_PUSH_RIGHT_2,
            PLAYER_PUSH_RIGHT_3
          ]

          var playerTexturesAnimations = [
            playerIdleTextures,
            playerWalkLeft,
            playerWalkRight,
            playerPushLeft,
            playerPushRight
          ];

          window.currentPlayerTexture = 0; // IDLE

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
                    // var texture = playerIdleTextures[0];
                    // playerIdleTextures.push(playerIdleTextures.shift());
                    // playerChangeTexture(players[i], texture)

                    if (players[i].animationsLeft === 0) {
                      currentPlayerTexture = 0;
                    }

                    var texture = playerTexturesAnimations[window.currentPlayerTexture][0];
                    playerTexturesAnimations[window.currentPlayerTexture].push(playerTexturesAnimations[window.currentPlayerTexture].shift());
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