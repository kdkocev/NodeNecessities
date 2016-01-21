'use strict';

var urls = require('./urls.js');
var router = require('express').Router();
var uploader = require('../modules/uploader.js');

var lobby = require("./lobby");
var game = require("./game");

// TODO: remove this argument
module.exports = function (passport) {

  // TODO: remove this argument
  var users = require("./users")(passport);

  /* GET home page. */
  router.get(urls.home, function (req, res, next) {
    res.render('index', {
      title: 'Express'
    });
  });

  router.route(urls.profile)
    .get(isLoggedIn, users.showProfile)
    .post(isLoggedIn, uploader, users.changeProfile);

  router.route(urls.login)
    .get(users.login)
    .post(users.checkRememberMe, users.loginPost);

  router.route(urls.signup)
    .get(users.signup)
    .post(users.signupPost);

  router.get(urls.logout, users.logout);

  router.get(urls.lobby, isLoggedIn, lobby.main);

  router.get(urls.confirmLogin, users.confirmLogin);

  router.get(urls.gameMain, isLoggedIn, game.main);

  return router;
};

// ensure that a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect(urls.home);
}