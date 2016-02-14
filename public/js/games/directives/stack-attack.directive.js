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
          $("canvas#stack-attack").attr("width", $(window).width());
          $("canvas#stack-attack").attr("height", $(window).height());

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


            window.aXY = gl.getAttribLocation(glprog, "aXY");
            // aRGB = gl.getAttribLocation(glprog,"aRGB");
            // uTime = gl.getUniformLocation(glprog,"uTime");
            window.uRotationMatrix = gl.getUniformLocation(glprog, "uRotationMatrix");

            window.direction = 0;

            var data = [0, 0, 1, 1];

            var buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

            gl.enableVertexAttribArray(aXY);
            gl.vertexAttribPointer(aXY, 2, gl.FLOAT, false, 2 * FLOATS, 0 * FLOATS);

            // gl.enableVertexAttribArray(aRGB);
            // gl.vertexAttrib3f(aRGB,0,0,0);
          }

          var then = 0;
          var frame = 0;
          var rotationSpeed = 10;
          var rotation = 0;

          function drawFrame(now) {

            now *= 0.001;
            var deltaTime = now - then;
            then = now;

            rotation += (rotationSpeed * deltaTime);

            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.uniformMatrix4fv(uRotationMatrix, false, zRotateMatrix(rotation));

            gl.drawArrays(gl.LINES, 0, 2);

            requestAnimationFrame(drawFrame);
          }

          start();
        }
      }
    })
})();