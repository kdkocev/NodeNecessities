'use strict'

var assert = require('assert');
var should = require('should');
var Browser = require('zombie');
var User = require('../models/User')

var util = require('util')
var exec = require('child_process').exec;

var mock_url = 'example.com';

Browser.localhost(mock_url, 2999);
const browser = new Browser();

describe('Functional Tests', () => {

  before(done => {
    // A database for testing only
    let db_name = 'nodenecessities_testdb';
    // Set testing environment
    process.env.NODE_ENV = 'test';
    process.env.TEST_DB = 'mongodb://localhost/' + db_name;
    // changing port so project can be tested without stopping the server
    process.env.PORT = 2999;

    new Promise((resolve, reject) => {
      var app = require('../app');
      var http = require('http');
      var server = http.createServer(app);
      server.listen(process.env.PORT);
      require('../modules/sockets.js')(server);
      resolve();
    }).then(() => {
      done()
    })
  });

  describe('Register', () => {

    describe('User visits signup page', () => {


      before(done => {
        browser.visit('/signup', done);
      })

      after(done => {
        User.getByEmail('zombie@underworld.dead')
          .then(user => {
            user.remove(done)
          })
          .catch(err => {
            throw err
          })
      })

      describe('fills form', () => {
        before(done => {
          browser
            .fill('name', 'Robert Paulson')
            .fill('email', 'zombie@underworld.dead')
            .fill('password', 'eat-the-living')
            .pressButton('Sign Up', done);
        });

        it('should be successful', () => {
          browser.assert.success()
        })

        it('should see profile page', () => {
          browser.assert.url({
            pathname: '/profile'
          });
        })
      })
    })

  })

  describe('Log in', () => {
    describe('User visits login page', () => {
      before(done => {
        var user = new User({
          local: {
            email: 'zombie@underworld.dead',
            password: 'eat-the-living'
          }
        })
        user.save(err => {
          browser.visit('/login', done)
        });
      });

      after(done => {
        User.getByEmail('zombie@underworld.dead')
          .then(user => {
            user.remove(done)
          })
          .catch(err => {
            throw err
          })
      });

      describe("fills up form", () => {
        before(done => {
          browser
            .fill('email', 'zombie@underworld.dead')
            .fill('password', 'eat-the-living')
            .pressButton('Login', done)
        })

        it('should be successful', () => {
          browser.assert.success()
        })

        it('should see profile page', () => {
          browser.assert.url({
            pathname: '/profile'
          })
        })
      })
    })
  })
})