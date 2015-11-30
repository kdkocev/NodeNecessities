module.exports = function(app, passport){
  var users = require("./users")(passport);

  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  app.get( '/profile', isLoggedIn, users.showProfile);
  
  app.get( '/login', users.login);
  app.post('/login', users.loginPost);

  app.get( '/signup', users.signup);
  app.post('/signup', users.signupPost);

  app.get('/logout',users.logout);
}

// ensure that a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}
