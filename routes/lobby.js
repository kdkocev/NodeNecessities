'use strict'
var express = require('express');
var router = express.Router();

module.exports = {
  main: function (req, res, next) {
    var user = {
      local: {
        email: req.user.local.email
      }
    };

    req.user.getToken(function (token) {
      user.token = token;
      res.render('lobby', {
        user: user
      });
    });
  }
}