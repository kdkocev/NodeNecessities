'use strict';

// in case Object.create does not exist
if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    var F = function () {};
    F.prototype = o;
    return new F();
  };
}

function start(objects) {
  var canvas = document.getElementById("stack-attack");
  canvas.addEventListener('webglcontextlost', function (event) {
    event.preventDefault();
  }, false);
  canvas.addEventListener('webglcontextrestored', function () {
    init();
  }, false);

  init(objects);
  drawFrame(0);
}


function init(objects) {
  window.gl = getContext("stack-attack");
  window.glprog = getProgram("vshader", "fshader");


  var aXY = gl.getAttribLocation(glprog, "aXY");
  window.aXYpos = gl.getAttribLocation(glprog, "aXYpos");
  window.aRGB = gl.getAttribLocation(glprog, "aRGB");

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


function Element() {
  // Because i use it in this.position
  var size = {
    x: 1 / 6,
    y: 2 / 7
  }
  this.size = size;
  this.position = {
    x: 0,
    y: 0,
    column: 0,
    row: 0,
    setX: function (x) {
      this.x = x;
      this.column = parseInt((((x + 1) / 2) * 12).toFixed(0));
    },
    setY: function (y) {
      this.y = y;
      this.row = parseInt((((y + 1) / 2) * 7 - 1).toFixed(0))
    },
    setColumn: function (col) {
      this.column = col;
      this.x = col * size.x - 1;
    },
    setRow: function (row) {
      this.row = row;
      this.y = ((row + 1) * size.y) - 1;
    }
  }

  this.data = [0, 0, 0, 1, 1, 0, 1, 1]

  this.color = {
    r: 127,
    g: 127,
    b: 127
  }

  this.animationLimit = {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0
  }

  this.speed = {
    x: 0,
    y: 0
  }
}

Element.prototype.setLimits = function (minX, maxX, minY, maxY) {
  this.animationLimit.minX = minX;
  this.animationLimit.maxX = maxX;
  this.animationLimit.minY = minY;
  this.animationLimit.maxY = maxY;
}

Element.prototype.noCollisions = function () {
  return true;
}

Element.prototype.checkLimits = function () {
  return (this.position.x + this.size.x <= this.animationLimit.maxX && this.position.x >= this.animationLimit.minX) && (this.position.y + this.size.y <= this.animationLimit.maxY && this.position.y >= this.animationLimit.minY && this.noCollisions());
}

Element.prototype.move = function () {
  if (this.checkLimits()) {
    this.position.setX(this.position.x + this.speed.x);
    this.position.setY(this.position.y + this.speed.y);
    if (!this.checkLimits()) {
      this.stopMovement();
    }
  }
}

Element.prototype.stopMovement = function () {
  this.position.setX(this.position.column / 6 - 1); // column * (1/6) - 1
  this.position.setY((this.position.row + 1) / 3.5 - 1);
  this.speed = {
    x: 0,
    y: 0
  };
}

Element.prototype.startMovement = function (speed) {
  this.speed = speed;
}



function Box(x, y) {
  Element.call(this);
  this.position.setX(x);
  this.position.setY(y);
  console.log(this);
}
Box.prototype = Object.create(Element.prototype);
Box.prototype.constructor = Box;



function Crane() {
  Element.call(this);
  this.setLimits(-1.2, 1.2, 1, 1);
}
Crane.prototype = Object.create(Element.prototype);
Crane.prototype.constructor = Crane;