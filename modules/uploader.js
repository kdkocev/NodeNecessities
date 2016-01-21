'use strict';
var multer = require('multer');
var User = require('../models/User');

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads/avatars/');
  },
  filename: function (req, file, callback) {
    User.randomString(10, function (filename) {
      req.user.setAvatar(filename);
      callback(null, filename);
    })
  }
});

var upload = multer({
  storage: storage
}).single('avatar');

module.exports = function (req, res, next) {
  upload(req, res, function (err) {
    if (req.body.type && req.body.type == "fast") {
      if (err) {
        res.send(400);
      } else {
        res.send({
          success: true,
          avatar: req.app.locals.urls.avatars_url + "/" + req.user.avatar
        });
      }
    } else {
      // This should be removed
      if (err) {
        next(err);
      } else {
        next();
      }
    }
  });
}