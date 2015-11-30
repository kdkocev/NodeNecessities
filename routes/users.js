var express = require('express');
var router = express.Router();

module.exports = function(passport){
  return {
    login: function(req, res, next){
      res.render('login');
    }, 
    loginPost: passport.authenticate('local-login', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/login', // redirect back to the signup page if there is an error
    }),
    showProfile: function(req, res, next){
      res.render('profile',{user:req.user});     
    },
    signup: function(req, res) {
      res.render('signup.jade');
    },
    signupPost:passport.authenticate('local-signup', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/signup', // redirect back to the signup page if there is an error
      // failureFlash : true // allow flash messages
    }),
    logout: function(req, res) {
        req.logout();
        res.redirect('/');
    }
  }
};
