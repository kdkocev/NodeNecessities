var User = require('../models/User.js');
var assert = require('assert');
var should = require('should');

var mongoose = require('mongoose');
var Browser = require("zombie");

// A database for testing only
var db_name = 'nodenecessities_testdb';

// Set testing environment
process.env.NODE_ENV = 'test';
process.env.TEST_DB = 'mongodb://localhost/'+db_name;
// changing port so project can be tested without stopping the server
process.env.PORT = 2999;
// Start the host process
var app = require('../bin/www');

// Cleaning the database we just used
function clearDB(){
  mongoose.connection.db.dropDatabase();
  mongoose.connection.close();
}

describe('Tests',function(){

  after(function(){
    clearDB();
  });

  describe('User model', function() {

    var test = {};

    beforeEach(function() {
      test.user = new User({name:"user1", email:"user@test.com"});
      test.user.save();
    });

    afterEach(function(done){
      User.remove({}, done);
    });

    it('should create a user', function(done){
      var testUser = new User({name:"testUser", email:"test@user.com"});
      testUser.save(done);
    });

    it('should fetch the created user', function(done){
      User.findOne({ name: test.user.name },function(e, docs){
        assert.equal(test.user.id,docs.id);
        done();
      });
    });

    it('should not create user with same email', function(done){
      var testUser = new User({ name:"whateva", email:test.user.email });
      testUser.save();
      
      User.findOne({email:test.user.email}, function(e, docs){
        assert.should.not.equal(test.user.id, testUser.id);
        done();
      });
    });
  });

  describe("Authentication", function(){

    before(function(){
      Browser.localhost('localhost', 3000);
    });
     
    describe('User Sign in via form', function() {

      var browser = new Browser({
        waitDuration: 29*1000
      });
     
      before(function() {
        return browser.visit('/signup');
      });

      after(function(done) {
        User.remove({}, done);
      });
   
      it('should fill the form and click send',function() {
        browser
          .fill('email',    'zombie@underworld.dead')
          .fill('password', 'eat-the-living');
        return browser.pressButton('Sign Up');
      });
   
      it('should be successful', function() {
        browser.assert.success();
      });
   
      it('should see welcome page', function() {
        assert.should.not.equal(browser.text().indexOf('User logged in is'),-1);
        assert.should.not.equal(browser.text().indexOf('zombie@underworld.dead'),-1);
      });
    });

    describe('should not be able to sign in with the same email',function(){
      var browser = new Browser({
        waitDuration: 29*1000
      });
     
      after(function(done) {
        User.remove({}, done);
      });

      before(function(){
        return browser.visit('/signup');
      });

      beforeEach(function(done){
        var user = new User();
        user.local = {email:"zombie@underworld.dead",password:"123"};
        user.save(done);
      });
      
      it('should try to sign up with same email', function(){ 
        browser
          .fill('email',    'zombie@underworld.dead')
          .fill('password', 'eat-the')
          return browser.pressButton('Sign Up');
      })

      it('should see the sign in page', function(){
        browser.assert.success();
        assert.equal(browser.location.pathname, "/signup");
      });
    });

    describe.skip('Token', function(){

    });
  });
});