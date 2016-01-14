// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var jwt_secret = require('../config/config').jwt_secret;

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        name         : {type:String, unique:true},
        email        : {type:String, unique:true},
        password     : {type: String, select: false} 
    },
    token : {type: String, select: false},
    rooms : Object
})

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password, cb) {
    console.log(password);
    mongoose.model('User', userSchema).findOne({"local.email":this.local.email}).select("+local.password").exec(function(err, user){
        if(err || !user.local.password) {
            cb(null);
        } else {
            cb(bcrypt.compareSync(password,user.local.password));
        }
    });
};

userSchema.methods.getToken = function(cb){
    mongoose.model('User', userSchema).findOne({"local.email":this.local.email}).select("+token").exec(function(err, user){
        if(err || !user.token) {
            cb(null);
        } else {
            cb(jwt.sign(user.token, jwt_secret));
        }
    });
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
