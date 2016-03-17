'use strict';

var User = require('../models/User.js');

var assert = require('assert');
var should = require('should');

var mongoose = require('mongoose');

// Drops the test database
function dropDB() {
	mongoose.connection.db.dropDatabase();
	mongoose.connection.close();
}

function throwError(err) {
	throw new Error(err);
}

describe("Unit tests", () => {

	before(() => {
		// A database for testing only
		let db_name = 'nodenecessities_testdb';
		// Set testing environment
		process.env.NODE_ENV = 'test';
		process.env.TEST_DB = 'mongodb://localhost/' + db_name;
		// changing port so project can be tested without stopping the server
		process.env.PORT = 2999;

		var app = require('../app.js');
	});


	after(() => {
		dropDB();
	})

	describe("User model", () => {
		it("Should pass", () => {

		})

		it("should create a user", done => {
			let user = new User({
				local: {
					email: "zombie@zombie.com"
				}
			});
			user.save(done);
		})

		it("should find the user from the prev test", done => {
			User.getByEmail('zombie@zombie.com')
				.then(user => {
					assert.notEqual(user, null, "User not found")
					done();
				}).catch(throwError)
		})

		it("should not be able to create a duplicate user", done => {
			let user = new User({
				local: {
					email: "zombie@zombie.com"
				}
			});
			user.save().then(user => {
				throw new Error("User should not be saved")
			}).catch(err => {
				if (err.code === 11000) {
					done();
				} else {
					throw new Error(err);
				}
			})
		})

		it("should encrypt the password", done => {
			let user = new User({
				local: {
					email: "test@test.com",
					password: "123"
				}
			})
			user.save()
				.then(user => {
					// console.log(user)
					user.validPassword("123")
						.then(() => {
							done()
						}).catch(() => {
							throw new Error("Password not encrypted correctly")
						})
				})
				.then(() => {
					done();
				}).catch(throwError)
		});

		it("should not encript passwords for second time", done => {
			User.findOne({
				"local.email": "test@test.com"
			})
				.select("+local.password").exec()
				.then(user => {
					let oldUserPassword = user.local.password;
					return user.save()
						.then(user => {
							assert.equal(user.local.password, oldUserPassword, "Password should not be changed on update")
							done()
						});
				}).catch(throwError)
		})

		it("should not SELECT the password with findOne/find", done => {
			User.findOne({
				"local.email": "test@test.com"
			}).exec()
				.then(user => {
					assert.equal(typeof user.local.password, "undefined", "User password is returned but should not be.")
					done()
				}).catch(throwError)
		})

		it("should be able to change password", done => {
			User.getByEmail('test@test.com')
				.then(user => {
					user.password = "1234";
					return user.save()
				})
				.then(user => {
					user.validPassword("1234")
						.then(() => {
							done()
						}).catch(() => {
							throw new Error("Password not changed correctly")
						})
				}).then(() => {
					done()
				}).catch(throwError)
		})

		it("should be able to create user with name field", done => {
			let user = new User({
				local: {
					name: "Zombie",
					email: "zombie@underworld.dead",
					password: "123"
				}
			})
			user.save()
				.then(user => {
					User.getByEmail('zombie@underworld.dead')
						.then(user => {
							assert.equal(user.local.name, "Zombie")
							done()
						})
						.catch(throwError)
				}).catch(throwError)
		})


		it("should be able to update user's name field", done => {
			User.getByEmail("zombie@underworld.dead")
				.then(user => {
					user.local.name = "Robert Paulson";
					user.save()
						.then(user => {
							assert.equal(user.local.name, "Robert Paulson", "Name is not changed")
							done()
						})
						.catch(throwError)
				}).catch(throwError)
		});

		it("should be able to change name field", done => {
			User.getByEmail('zombie@underworld.dead')
				.then(user => {
					user.local.name = "Mayhem";
					user.save().then(user => {
						assert.equal(user.local.name, "Mayhem", "User Name not changed")
						done()
					}).catch(throwError)
				}).catch(throwError)
		})

		it("should be able to set avatar", done => {
			User.getByEmail('zombie@underworld.dead')
				.then(user => {
					user.setAvatar("someavatar")
						.then(user => {
							assert.equal(user.avatar, "someavatar", "Avatar not set correctly")
							done()
						}).catch(throwError)
				}).catch(throwError)
		})

		it("should be able to change avatar", done => {
			User.getByEmail('zombie@underworld.dead')
				.then(user => {
					user.setAvatar('someotheravatar')
						.then(user => {
							assert.equal(user.avatar, "someotheravatar")
							done()
						}).catch(throwError);
				}).catch(throwError)
		})

		it("should have the right token")

		it("should be able to save remember_me")
	});

	describe("Sockets", () => {
		it("should pass", () => {

		})
	})
})