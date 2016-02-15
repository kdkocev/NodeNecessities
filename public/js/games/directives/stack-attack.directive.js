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

          function start() {
            var canvas = document.getElementById("stack-attack");
            canvas.addEventListener('webglcontextlost', function (event) {
              event.preventDefault();
            }, false);
            canvas.addEventListener('webglcontextrestored', function () {
              init();
            }, false);

            console.log("start");

            init();
            drawFrame(0);
          }

          function init() {
            window.gl = getContext("stack-attack");
            window.glprog = getProgram("vshader", "fshader");


            var aXY = gl.getAttribLocation(glprog, "aXY");
            window.aXYpos = gl.getAttribLocation(glprog, "aXYpos");
            window.aRGB = gl.getAttribLocation(glprog, "aRGB");

            function getTile(column, color) {
              // var tile
              return {
                position: {
                  column: column,
                  x: -1 + column * (1 / 6),
                  y: 2,
                },
                size: {
                  x: 1 / 6,
                  y: 2 / 7
                },
                data: [0, 0, 0, 1, 1, 0, 1, 1],
                drawType: gl.TRIANGLE_STRIP,
                color: {
                  r: color[0],
                  g: color[1],
                  b: color[2]
                },
                name: "tile",
                falling: false,
                positionLimit: {
                  minX: -1,
                  maxX: 1,
                  // overwritten
                  minY: window.floor.height
                },
                setColumn: function (column) {
                  this.position.column = column;
                  this.position.x = -1 + column * (1 / 6);
                },
                taken: false,
                notInGame: true,
                reset: function () {
                  this.taken = false;
                  this.notInGame = true;
                  this.position.column = -1;
                  this.position.x = 0;
                  this.position.y = 1;
                  this.falling = false;
                }
              };
            }

            window.floor = {
              position: {
                x: -1,
                y: 1 / 14 - 1
              },
              size: {
                x: 2,
                y: 1 / 14 - 1
              },
              data: [0, 0, 0, 1, 1, 0, 1, 1],
              drawType: gl.TRIANGLE_STRIP,
              color: {
                r: 0,
                g: 255,
                b: 255
              },
              height: 1 / 14 - 1,
              name: "floor",
              falling: false
            }

            function getCrane(x, direction) {
              return {
                name: "crane",
                falling: false,
                position: {
                  x: x,
                  y: 1 - 1 / 14
                },
                size: {
                  x: 1 / 6,
                  y: 2 / 7
                },
                data: [0, 0, 0, 1, 1, 0, 1, 1],
                drawType: gl.TRIANGLE_STRIP,
                color: {
                  r: 255,
                  g: 0,
                  b: 0
                },
                direction: direction,
                positionLimit: {
                  minX: -1.2,
                  maxX: 1.2
                },
                tile: {},
                dropPlace: {
                  minX: -2,
                  maxX: -2,
                  column: -1
                },
                attachTile: function (tile) {
                  this.startMoving();
                  this.tile = tile;
                  this.tile.falling = false;
                  this.tile.position.y = 1 - 1 / 7;
                  this.setDropPlace(this.checkDropPlace(Math.floor(random(0, 12))));
                  this.tile.setColumn(this.dropPlace.column)
                  this.tile.position.x = this.position.x;
                  this.tile.notInGame = false;

                  this.tile.taken = true;

                },
                detachTile: function () {
                  this.tile.setColumn(this.dropPlace.column)
                  this.tile.falling = true;
                  this.tile = {};
                },
                setDropPlace: function (column) {
                  this.dropPlace.column = column;
                  this.dropPlace.minX = -1 + column * (1 / 6);
                  this.dropPlace.maxX = -1 + (column + 1) * (1 / 6);
                },
                startMoving: function () {
                  this.direction *= -1;
                  this.position.x = parseFloat(this.position.x.toFixed(1));
                },
                checkDropPlace: function (column) {
                  // Protects against endless cycle
                  var c = 0;
                  while (window.floorLevels[column] > 4 && c < 40) {
                    column = Math.floor(random(0, 12));
                    c++;
                  }
                  return column;
                }
              }
            }

            window.objects = [];

            var tiles = [];
            for (var i = 0; i < 60; i++) {
              var tile = getTile(0, [random(50, 255), random(50, 255), random(50, 255)]);
              tiles.push(tile);
              objects.push(tile);
            }

            var cranes = [
              getCrane(-1.2, -1),
              getCrane(1.2, 1),
              getCrane(-1.2, -1)
            ]
            for (var i in cranes) {
              objects.push(cranes[i])
            }
            objects.push(floor);

            // Cranes animation
            window.craneNumber = 0;
            setInterval(function () {
              for (var i = 0; i < tiles.length; i++) {
                if (!tiles[i].taken && tiles[i].notInGame) {
                  cranes[craneNumber++].attachTile(tiles[i]);
                  break;
                }
              }
              if (craneNumber > 2) craneNumber = 0;
            }, 1000);

            var data = [];

            function addObject(o) {
              for (var i = 0; i < o.data.length; i++) {
                data.push(o.data[i++] * o.size.x);
                data.push(o.data[i] * o.size.y);
              }
            }

            for (var i in objects) {
              addObject(objects[i])
            }

            var buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

            gl.enableVertexAttribArray(aXY);
            gl.vertexAttribPointer(aXY, 4, gl.FLOAT, false, 2 * FLOATS, 0 * FLOATS);
          }

          // Constant animations at every fps rate
          var then = 0;


          function drawFrame(now) {

            now *= 0.001;
            var deltaTime = now - then;
            then = now;

            gl.clear(gl.COLOR_BUFFER_BIT);
            window.floorLevels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            sortObj();
            setObjLimitations();

            var offset = 0;
            for (var i in objects) {

              if (objects[i].name === "tile") {
                fall(objects[i]);
              }
              if (objects[i].name === "crane") {
                craneMove(objects[i]);
              }

              checkLevelComplete();

              gl.vertexAttrib2f(aXYpos, objects[i].position.x, objects[i].position.y);
              gl.vertexAttrib3f(aRGB, objects[i].color.r / 255, objects[i].color.g / 255, objects[i].color.b / 255);
              gl.drawArrays(objects[i].drawType, offset, objects[i].data.length / 2)
              offset += objects[i].data.length / 2;
            }

            requestAnimationFrame(drawFrame);
          }

          function fall(object) {
            var speed = 0.02;

            if (!object.falling) return;

            if (object.position.y > object.positionLimit.minY) {
              object.position.y -= speed;
            }
          }

          function setLimitations(object) {
            if (!object.falling) return;
            object.positionLimit.minY = parseFloat((floorLevels[object.position.column] * object.size.y).toFixed(3)) + floor.height;
            floorLevels[object.position.column]++;
          }

          function setObjLimitations() {
            for (var i in objects) {
              if (!objects[i].falling || objects[i].name !== "tile") continue;
              objects[i].positionLimit.minY = parseFloat((floorLevels[objects[i].position.column] * objects[i].size.y).toFixed(3)) + floor.height;
              floorLevels[objects[i].position.column]++;
            }
          }

          function sortObj() {
            for (var i = 0; i < objects.length; i++) {
              for (var k = i; k < objects.length; k++) {
                if (objects[i].name == "tile" && objects[k].name == "tile" && objects[i].position.y > objects[k].position.y) {
                  var temp = objects[i];
                  objects[i] = objects[k];
                  objects[k] = temp;
                }
              }
            }
          }

          function craneMove(object) {
            var speed = 0.02;
            if (object.position.x <= object.positionLimit.maxX && object.position.x >= object.positionLimit.minX) {
              object.position.x += speed * object.direction;
              if (object.tile.position)
                object.tile.position.x += speed * object.direction;
              if (object.tile.position && object.position.x > object.dropPlace.minX && object.position.x < object.dropPlace.maxX) {
                object.detachTile();
              }
            }
          }

          function checkLevelComplete() {
            var complete = true;
            for (var i = 0; i < floorLevels.length; i++) {
              if (floorLevels[i] == 0) {
                complete = false;
              }
            }
            if (complete) {

              var tiles = objects.filter(function (x) {
                return x.name == "tile" && x.position.y <= floor.height;
              });
              if (tiles.length == 12) {
                for (var k in tiles) {
                  tiles[k].reset();
                }
                scope.score += 100;
              }
            }
          }

          start();
        }
      }
    })
})();