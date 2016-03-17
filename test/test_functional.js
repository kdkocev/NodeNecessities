var assert = require('assert');
var should = require('should');
var Browser = require("zombie");

var util = require('util')
var exec = require('child_process').exec;


describe("Functional Tests", () => {
  describe("Register", () => {
    it("should pass", () => {

    })
  })
  describe("Log in", () => {
    it("should pass", () => {

    })
  })
})






return;
describe("Functional Tests", function () {
  describe.skip("Authentication", function () {

    before(function (done) {
      // Starts a server for functional tests
      child = exec("node ./bin/www&", function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        done();
      });
    });

    beforeEach(function () {
      Browser.localhost('localhost', 2999);
    })

    it.skip("Should test", function () {
      describe('User Sign in via form', function () {

        var browser = new Browser();

        before(function () {
          return browser.visit('http://localhost:2999/signup');
        });

        it('should fill the form and click send', function (done) {
          browser
            .fill('email', 'zombie@underworld.dead')
            .fill('password', 'eat-the-living');
          browser.pressButton('Sign Up', function () {
            console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZzz")
            assert.ok(browser.success);
            done();
          })
        });

        it('should be successful', function () {
          browser.assert.success();
        });

        it('should see welcome page', function () {
          assert.should.not.equal(browser.text().indexOf('User logged in is'), -1);
          assert.should.not.equal(browser.text().indexOf('zombie@underworld.dead'), -1);
        });
      });
    });

    it('should not be able to sign in with the same email', function () {

      var browser = new Browser();

      before(function (done) {
        browser.visit('http://localhost:2999/signup');

        var user = new User({
          local: {
            name: "asdf",
            email: "zombie@underworld.dead",
            password: "123"
          }
        });
        user.save(done);
      });
    });

    after(function () {
      browser.close();
    })

    it('should try to sign up with same email', function () {

      before(function () {
        var browser = new Browser();
        browser.visit("http://localhost:2999/signup", function () {
          browser
            .fill('email', 'zombie@underworld.dead')
            .fill('password', '123')
        });
        return browser.pressButton('Sign Up');
      });

      it('should see the sign in page', function () {
        browser.assert.success();
        assert.equal(browser.location.pathname, "/signup");
      });

    })


  });
  describe.skip('Token', function () {

  });
});