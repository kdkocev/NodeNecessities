var User = require('../models/User');
var jwt = require('jsonwebtoken');
var jwt_secret = require('../config/config.js').jwt_secret;

module.exports = {
  login_remember_me: function(req, res, next){
    if(req.body.remember_me){
      User.findOne({ 'local.email' :  req.body.email }, function(err, user) {
        user.validPassword(req.body.password,function(is_valid){
          if(err || !is_valid) {
            next();
          } else {
            var randomstr = randomString(14);
            var token = jwt.sign(randomstr, jwt_secret);
            res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 7*24*60*60*1000 });// a week
            user.token = randomstr;
            user.save(function (err) {
              next();
            });
          }
        });
      });
    } else {
      next();
    }
  },
  check_remember_me: function(req, res, next){
    if(req.cookies.remember_me) {
      jwt.verify(req.cookies.remember_me, jwt_secret, function(err, decoded) {
        if(err) { 
          next();
        } else {
          User.findOne({token:decoded},function(err, user){
            if(err || !user) {
              next();
            } else {
              req.logIn(user, function(err) {
                if (err) { next(err); }
                next();
              });
            }
          });
        }
      });
    } else {
      next();
    }
  }
}

function randomString(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}