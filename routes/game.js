'use strict'
var express = require('express');
var router = express.Router();

module.exports = {
  main: function (req, res, next) {
    res.render("game");
  }
}