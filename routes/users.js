'use strict'
var express = require('express');
var router = express.Router();

var login_strategies = require('../config/login-strategies');
var urls = require('./urls');

module.exports = function (passport) {
  return {
    login: function (req, res, next) {
      res.render('login', (err, html) => {
        if (!err)
          res.write(html);
        res.end();
      });
    },

    checkRememberMe: login_strategies.login_remember_me,

    loginPost: passport.authenticate('local-login', {
      successRedirect: urls.profile,
      failureRedirect: urls.login
    }),
    // Only shows MY profile for now
    showProfile: function (req, res, next) {
      res.render('profile');
    },
    signup: function (req, res) {
      res.render('signup');
    },
    signupPost: passport.authenticate('local-signup', {
      successRedirect: urls.profile,
      failureRedirect: urls.signup
    }),
    logout: function (req, res) {
      req.app.locals.user = null;
      res.clearCookie('remember_me');
      req.logout();
      res.redirect(urls.home);
    },
    changeProfile: function (req, res) {
      if (req.body.name) {
        console.log("Setting name to: " + req.body.name);
        req.user.setName(req.body.name, res.redirect('back'));
      } else {
        res.redirect('back');
      }
    },
    confirmLogin: function (req, res) {
      if (!req.user) {
        res.send({});
      } else {
        res.send({
          id: req.user.id,
          name: req.user.local.name,
          email: req.user.local.email,
          avatar: req.app.locals.urls.avatars_url + "/" + req.user.avatar
        })
      }
    }
  }
};