module.exports = function (app, passport) {
  'use strict';

  var users = require("./users")(passport);

  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  app.get( '/profile', isLoggedIn, users.showProfile);

  app.get( '/login', users.login);
  app.post('/login', users.checkRememberMe, users.loginPost);

  app.get( '/signup', users.signup);
  app.post('/signup', users.signupPost);

  app.get('/logout',users.logout);
};

// ensure that a user is logged in
function isLoggedIn(req, res, next) {
  'use strict';
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}
