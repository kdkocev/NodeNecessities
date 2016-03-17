
require("./test_functional.js");
require("./test_unit.js");


return;

var User = require('../models/User.js');
var assert = require('assert');
var should = require('should');

var mongoose = require('mongoose');
// A database for testing only
var db_name = 'nodenecessities_testdb';

// Set testing environment
process.env.NODE_ENV = 'test';
process.env.TEST_DB = 'mongodb://localhost/' + db_name;
// changing port so project can be tested without stopping the server
process.env.PORT = 2999;
// Start the host process
var app = require('../bin/www');

// Cleaning the database we just used
function clearDB() {
  mongoose.connection.db.dropDatabase();
  mongoose.connection.close();
}

describe('Unit tests', function () {

  after(function () {
    clearDB();
  });
  describe('User model', function () {

    var test = {};

    beforeEach(function () {
      test.user = new User({
        local: {
          name: "user1",
          email: "user@test.com"
        }
      });
      test.user.save();
    });

    afterEach(function (done) {
      User.remove({}, done);
    });

    it('should create a user', function (done) {
      var testUser = new User({
        local: {
          name: "testUser",
          email: "test@user.com"
        }
      });
      testUser.save(done);
    });

    it('should fetch the created user', function (done) {
      User.findOne({
        "local.name": test.user.local.name
      }, function (e, docs) {
        assert.equal(test.user.id, docs.id);
        done();
      });
    });

    it('should not create user with same email', function (done) {
      var testUser = new User({
        local: {
          name: "whateva",
          email: test.user.email
        }
      });
      testUser.save();

      User.findOne({
        "local.email": test.user.local.email
      }, function (e, docs) {
        assert.should.not.equal(test.user.id, testUser.id);
        done();
      });
    });
  });
});