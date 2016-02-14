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
            // window.uRotationMatrix = gl.getUniformLocation(glprog, "uRotationMatrix");

            function getTile(column, y, color) {

              // x > 0 , x < 12
              // 

              // var tile
              return {
                position: {
                  column: column,
                  x: -1 + column * (1 / 6),
                  y: y,
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
                falling: true,
                positionLimit: {
                  minX: -1,
                  maxX: 1,
                  // overwritten
                  minY: window.floor.height
                },
                setColumn: function (column) {
                  this.position.column = column;
                  this.position.x = -1 + column * (1 / 6);
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
                  this.tile.position.y = 1;
                  this.setDropPlace(Math.floor(random(0, 12)));
                  this.tile.setColumn(this.dropPlace.column)

                  this.tile.taken = true;

                  console.log(this.tile.position, this.dropPlace)
                },
                detachTile: function () {
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
                }
              }
            }

            window.objects = [];

            var tiles = [];
            for (var i = 0; i < 15; i++) {
              var tile = getTile(Math.floor(random(0, 12)), random(0, 1), [random(50, 255), random(50, 255), random(50, 255)]);
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

            setTimeout(function () {
              cranes[0].attachTile(tiles[0]);
            }, 3000);

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

            //rotation += (rotationSpeed * deltaTime);

            gl.clear(gl.COLOR_BUFFER_BIT);

            //gl.uniformMatrix4fv(uRotationMatrix, false, zRotateMatrix(rotation));

            // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            // gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4);




            window.floorLevels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            var offset = 0;
            for (var i in objects) {
              if (objects[i].name === "tile") {
                fall(objects[i]);
                setLimitations(objects[i]);
              }
              if (objects[i].name === "crane") {
                craneMove(objects[i]);
              }
              gl.vertexAttrib2f(aXYpos, objects[i].position.x, objects[i].position.y);
              gl.vertexAttrib3f(aRGB, objects[i].color.r / 255, objects[i].color.g / 255, objects[i].color.b / 255);
              gl.drawArrays(objects[i].drawType, offset, objects[i].data.length / 2)
              offset += objects[i].data.length / 2;
            }

            requestAnimationFrame(drawFrame);
          }

          function fall(object) {
            var speed = 0.01;

            if (!object.falling) return;

            if (object.position.y > object.positionLimit.minY) {
              object.position.y -= speed;
            }
          }

          function setLimitations(object) {
            if (!object.falling) return;
            object.positionLimit.minY = parseFloat((floorLevels[object.position.column] * object.size.y).toFixed(3)) + floor.height;
            floorLevels[object.position.column]++;
            if (object.taken) {
              console.log(object, floorLevels);
              object.taken = false;
            }
          }

          function craneMove(object) {
            var speed = 0.01;
            if (object.position.x <= object.positionLimit.maxX && object.position.x >= object.positionLimit.minX) {
              object.position.x += speed * object.direction;
              if (object.tile.position && object.position.x > object.dropPlace.minX && object.position.x < object.dropPlace.maxX) {
                object.detachTile();
              }
            }
          }

          start();
        }
      }
    })
})();