'use strict';

var urls = require('./urls.js');
var router = require('express').Router();
var uploader = require('../modules/uploader.js');

module.exports = function (passport) {

  var users = require("./users")(passport);
  var lobby = require("./lobby");

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

  return router;
};

// ensure that a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}