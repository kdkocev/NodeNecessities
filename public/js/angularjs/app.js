var app = angular.module('nodenecessities', [])

app.run(function ($rootScope, $http, socket) {
  $http.get('/confirm-login')
    .success(function (user) {
      if (user) {
        $rootScope.user = user;
      }
    });

  $rootScope.inviteToGame = function (user) {
    console.log(user);
    socket.emit("user:inviteToGame", {
      receiver: user,
      sender: $rootScope.user
    });
  }

});