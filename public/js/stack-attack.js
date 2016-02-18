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
    init(objects);
  }, false);

  init(objects);
  drawFrame(0);
}


function init(objects) {
  window.gl = getContext("stack-attack");
  window.glprog = getProgram("vshader", "fshader");


  window.aXY = gl.getAttribLocation(glprog, "aXY");
  window.aXYpos = gl.getAttribLocation(glprog, "aXYpos");
  window.aRGB = gl.getAttribLocation(glprog, "aRGB");

  addObjectsToDraw(objects);
}

function addObjectsToDraw(objects) {
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

  //addObjectsToDraw(objects);

  gl.clear(gl.COLOR_BUFFER_BIT);

  // For buffer drawing
  var offset = 0;
  for (var i in objects) {

    cb(objects[i])

    gl.vertexAttrib3f(aRGB, objects[i].color.r / 255, objects[i].color.g / 255, objects[i].color.b / 255);
    gl.vertexAttrib2f(aXYpos, objects[i].position.x, objects[i].position.y);
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
      this.column = Math.round((((x + 1) / 2) * 12));
    },
    setY: function (y) {
      this.y = y;
      this.row = Math.round((((y + 1) / 2) * 7 - 1))
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
    minX: -1,
    maxX: 1,
    minY: -1,
    maxY: 1
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
    var last_position = {
      column: this.position.column,
      row: this.position.row
    };
    this.position.setX(this.position.x + this.speed.x);
    this.position.setY(this.position.y + this.speed.y);
    if (!this.checkLimits()) {
      if (this.constructor.name == "Crane") {
        if (this.speed.x > 0) {
          this.position.setX(this.animationLimit.maxX - this.size.x);
        } else {
          this.position.setX(this.animationLimit.minX);
        }
      } else {
        this.position.column = last_position.column;
        this.position.row = last_position.row;
      }
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
  this.colidesWith = [];
}
Box.prototype = Object.create(Element.prototype);
Box.prototype.constructor = Box;
Box.prototype.noCollisions = function () {
  if (this.speed.x === 0 && this.speed.y === 0) return;
  for (var i in this.colidesWith) {
    if (this.position.column == this.colidesWith[i].position.column && this.position.row == this.colidesWith[i].position.row) {
      return false;
    }
  }
  return true;
}
Box.prototype.fall = function () {
  this.startMovement({
    x: 0,
    y: -0.01
  });
  this.animationLimit.minY = -1;
}



function Crane() {
  Element.call(this);
  this.position.setY(0.9);
  this.position.setX(-1);
  this.setLimits(-1.3, 1.3, 0, 2);
  this.box = {};
  this.noBox = true;
}
Crane.prototype = Object.create(Element.prototype);
Crane.prototype.constructor = Crane;

Crane.prototype.stopMovement = function () {
  this.speed = {
    x: 0,
    y: 0
  };
}

Crane.prototype.takeBox = function (box) {
  this.box = box;
  this.box.position.x = 1;
  this.box.position.y = 1;
  this.dropPosition = Math.floor(random(0, 12));
  this.noBox = false;
}

// Calls Element.move()
Crane.prototype.move = function () {
  this.__proto__.__proto__.move.call(this);
  if (!this.noBox) {
    this.box.position.setX(this.position.x);
    this.box.position.setY(this.position.y - 0.1);
    if (this.box.position.column === this.dropPosition) {
      this.box.position.setRow(5);
      this.box.position.setColumn(this.dropPosition);
      this.box.fall();
      this.box = {};
      this.noBox = true;
    }
  }
}



function Player() {
  Element.call(this);
  this.size.y *= 2;
  this.position.setColumn(0);
  this.position.setRow(0);
  this.colidesWith = [];
  this.startMovement({
    x: 0,
    y: -0.01
  });
}
Player.prototype = Object.create(Element.prototype);
Player.prototype.constructor = Player;

Player.prototype.noCollisions = function () {
  if (this.speed.x === 0 && this.speed.y === 0) return;
  for (var i in this.colidesWith) {
    if (this.position.column == this.colidesWith[i].position.column && this.position.row == this.colidesWith[i].position.row) {
      return false;
    }
  }
  return true;
}

Player.prototype.fall = function () {
  this.startMovement({
    x: 0,
    y: -0.01
  });
  this.animationLimit.minY = -1;
}

Player.prototype.startMovement = function (speed) {
  this.speed = speed;
}

Player.prototype.walkLeft = function () {
  if (this.position.column === 0) return;
  this.animationLimit.minX = this.position.x - this.size.x;
  this.startMovement({
    x: -0.01,
    y: 0
  });
}

Player.prototype.walkRight = function () {
  if (this.position.column === 11) return;
  console.log("right");
  this.animationLimit.maxX = this.position.x + this.size.x * 2;
  this.startMovement({
    x: +0.01,
    y: 0
  });
}

Player.prototype.Jump = function () {
  this.animationLimit.maxY = this.position.y + this.size.y * 1.5;
  this.startMovement({
    x: 0,
    y: 0.015
  });
}

Player.prototype.stopMovement = function () {
  this.position.setX(this.position.column / 6 - 1); // column * (1/6) - 1
  this.position.setY((this.position.row + 1) / 3.5 - 1);
  var below = false;
  for (var i in this.colidesWith) {
    if (this.colidesWith[i].position.column == this.position.column && this.colidesWith[i].position.row == this.position.row - 1) {
      below = true;
    }
  }
  this.speed = {
    x: 0,
    y: 0
  }
  if (!below) {
    this.speed = {
      x: 0,
      y: -0.01
    }
  }
  this.setLimits(-1, 1, -1, 1);
}