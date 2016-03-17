var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var jwt_secret = require('../config/config').jwt_secret;



var userSchema = mongoose.Schema({

    local: {
        name: {
            type: String,
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
    game: {
        inGame: {
            type: Boolean,
        },
        id: {
            type: String,
        }
    },
    // not used for now
    rooms: Object
})


userSchema.pre('save', function (next) {
    var self = this;
    mongoose.model('User', userSchema).findById(this._id)
        .select("+local.password").exec(function (err, user) {
            if (err) next(err);
            if (!user) {
                // console.log("generating new password");
                self.local.password = self.generateHash(self.local.password);
                next();
            } else {
                // console.log("the user saved is not new")
                if (user.local.password === self.local.password) {
                    next();
                } else {
                    self.local.password = self.generateHash(self.local.password);
                    next();
                }
            }
        });
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};



userSchema.methods.validPassword = function (password, cb) {
    var self = this;
    // return new Promise((resolve, reject) => {
    return mongoose.model('User', userSchema).findById(self._id)
        .select("+local.password").exec()
        .then(user => {
            if (bcrypt.compareSync(password, user.local.password)) {
                // console.log("password match")
                return Promise().resolve();
                // resolve();
            } else {
                // console.log("password does not match")
                return Promise().reject();
                // throw new Error("Invalid password")
                // console.log("password doesnt match")
                // reject("Password doesnt match");
            }
        })
        // });
};



userSchema.methods.getToken = function (cb) {
    mongoose.model('User', userSchema).findById(this._id)
        .select("+token").exec(function (err, user) {
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


/**
 *   @return Promise
 */
userSchema.statics.getByEmail = function (email) {
    return mongoose.model('User', userSchema).findOne({
        'local.email': email
    }).exec();
}


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
    return this.save();
}


// TODO: use validate instead
userSchema.methods.setName = function (name, cb) {
    if (typeof name == 'string' && name.length > 3) {
        this.local.name = name;
        this.save(cb);
    }
}

userSchema.statics.startGame = function (gameid, users, cb) {
    console.log(users);
    mongoose.model('User', userSchema).find({
        $or: [{
            "local.email": users[0]
        }, {
            "local.email": users[1]
        }]
    }, function (err, users) {
        if (err) return false;
        else {
            console.log(users);
            var game = {
                inGame: true,
                id: gameid
            };
            users[0].game = game;
            users[1].game = game;
            users[0].save().then(function () {
                users[1].save(cb);
            });
        }
    });
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