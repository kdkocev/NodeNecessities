'use strict';


// in case Object.create does not exist
if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    var F = function () {};
    F.prototype = o;
    return new F();
  };
}

function start() {
  var canvas = document.getElementById("stack-attack");
  canvas.addEventListener('webglcontextlost', function (event) {
    event.preventDefault();
  }, false);
  canvas.addEventListener('webglcontextrestored', function () {
    init();
  }, false);

  init();
  drawFrame(0);
}


function init() {
  window.gl = getContext("stack-attack");
  window.glprog = getProgram("vshader", "fshader");


  var aXY = gl.getAttribLocation(glprog, "aXY");
  window.aXYpos = gl.getAttribLocation(glprog, "aXYpos");
  window.aRGB = gl.getAttribLocation(glprog, "aRGB");

  // var data = [];

  // function addObject(o) {
  //   for (var i = 0; i < o.data.length; i++) {
  //     data.push(o.data[i++] * o.size.x);
  //     data.push(o.data[i] * o.size.y);
  //   }
  // }

  // for (var i in objects) {
  //   addObject(objects[i])
  // }

  // var buf = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  // gl.enableVertexAttribArray(aXY);
  // gl.vertexAttribPointer(aXY, 4, gl.FLOAT, false, 2 * FLOATS, 0 * FLOATS);
}

// Constant animations at every fps rate
var then = 0;

function drawFrame(now, objects, cb) {

  now *= 0.001;
  var deltaTime = now - then;
  then = now;

  gl.clear(gl.COLOR_BUFFER_BIT);

  // For buffer drawing
  var offset = 0;
  for (var i in objects) {

    cb(objects[i])

    gl.vertexAttrib2f(aXYpos, objects[i].position.x, objects[i].position.y);
    gl.vertexAttrib3f(aRGB, objects[i].color.r / 255, objects[i].color.g / 255, objects[i].color.b / 255);
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, objects[i].data.length / 2)
    offset += objects[i].data.length / 2;
  }

  requestAnimationFrame(window.nextFrame);
}

function addItemForDrawing(data) {
  var buf = window.gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(aXY);
  gl.vertexAttribPointer(aXY, 4, gl.FLOAT, false, 2 * FLOATS, 0 * FLOATS);
}


function Block() {
  this.position = [];
  this.scale = [];
  this.data = [0, 0, 1, 0, 0, 1, 1, 1]; // Triangles
  this.color = [];
  this.fill = function () {}
}

addItemForDrawing([0, 0, 1, 0, 0, 1, 1, 1]);