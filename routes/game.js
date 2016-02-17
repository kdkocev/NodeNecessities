'use strict'
var express = require('express');
var router = express.Router();

module.exports = {
  main: function (req, res, next) {
    req.user.getToken(function (token) {
      res.render("games/stack-attack", {
        token: token
      });
    });
  },
  gamepingpong: function (req, res, next) {
    req.user.getToken(function (token) {
      res.render("games/ping-pong", {
        token: token
      })
    });
  }
}