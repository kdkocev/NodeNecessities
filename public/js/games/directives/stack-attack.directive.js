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
                  maxX: 1
                  // overwritten
                  //minY: window.floor.height
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
              name: "floor"
            }

            window.objects = [];
            //for (var i = 0; i < 10; i++) {
            //objects.push(getTile((Math.floor(random(0, 12)) / 12), random(0, 1), [random(0, 255), random(0, 255), random(0, 255)]))
            //}
            for (var i = 0; i < 15; i++) {
              objects.push(getTile(Math.floor(random(0, 12)), random(0, 1), [random(50, 255), random(50, 255), random(50, 255)]));
            }
            objects.push(floor);

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
              if (objects[i].name !== "tile") continue;
              fall(objects[i]);
              setLimitations(objects[i]);
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

            if (object.position.y > object.positionLimit.y) {
              object.position.y -= speed;
            }
          }

          function setLimitations(object) {
            object.positionLimit.y = parseFloat((floorLevels[object.position.column] * object.size.y).toFixed(3)) + floor.height;
            floorLevels[object.position.column]++;
          }

          start();
        }
      }
    })
})();