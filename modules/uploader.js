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
    console.log("uploader");
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            next(err);
        } else {
            next();
        }
    });
}