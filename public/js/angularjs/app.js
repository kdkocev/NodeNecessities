var app = angular.module('nodenecessities', [])

app.run(function ($rootScope, $http, socket) {
  $http.get('/confirm-login')
    .success(function (user) {
      if (user) {
        $rootScope.user = user;
      }
    });

});