var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var jwt_secret = require('../config/config').jwt_secret;



var userSchema = mongoose.Schema({

    local: {
        name: {
            type: String,
            unique: true
        },
        email: {
            type: String,
            unique: true
        },
        password: {
            type: String,
            select: false
        }
    },
    avatar: {
        type: String
    },
    token: {
        type: String,
        select: false
    },
    remember_me: {
        type: String,
        select: false
    },
    rooms: Object
})



userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};



userSchema.methods.validPassword = function (password, cb) {
    mongoose.model('User', userSchema).findOne({
        "local.email": this.local.email
    }).select("+local.password").exec(function (err, user) {
        if (err || !user.local.password) {
            cb(null);
        } else {
            cb(bcrypt.compareSync(password, user.local.password));
        }
    });
};



userSchema.methods.getToken = function (cb) {
    mongoose.model('User', userSchema).findOne({
        "local.email": this.local.email
    }).select("+token").exec(function (err, user) {
        if (err || !user.token) {
            cb(null);
        } else {
            cb(jwt.sign(user.token, jwt_secret));
        }
    });
};



userSchema.statics.getUserByToken = function (token, cb) {
    jwt.verify(token, jwt_secret, function (err, decoded) {
        mongoose.model('User', userSchema).findOne({
            "token": decoded
        }).select("+token").exec(function (err, user) {
            if (err || !user) {
                cb(null);
            } else {
                cb(user);
            }
        });
    });
};



userSchema.methods.generateToken = function () {
    this.token = randomString(14);
    this.save();
    return this.token;

}

userSchema.statics.randomString = function (len, cb) {
    cb(randomString(len));
}

userSchema.statics.verifyToken = function (token, cb) {
    jwt.verify(token, jwt_secret, function (err, decoded) {
        cb(err, decoded);
    });
}

userSchema.methods.setAvatar = function (avatarName) {
    this.avatar = avatarName;
    this.save();
}

userSchema.methods.setName = function (name, cb) {
    if (typeof name == 'string' && name.length > 3) {
        this.local.name = name;
        this.save(cb);
    }
}

function randomString(len) {
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = mongoose.model('User', userSchema);