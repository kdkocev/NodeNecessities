var app = angular.module('nodenecessities', [])

app.run(function ($rootScope, $http, socket) {
  $http.get('/confirm-login')
    .then(function (data) {
      if (data.data) {
        $rootScope.user = data.data;
      }
    });

  $rootScope.inviteToGame = function (user) {
    socket.emit("user:inviteToGame", {
      receiver: user,
      sender: $rootScope.user
    });
  }

  $rootScope.uploadFile = function (files, cb) {
    var fd = new FormData();
    //Take the first selected file
    fd.append("avatar", files[0]);
    fd.append("type", "fast");

    $http.post('/profile', fd, {
      withCredentials: true,
      headers: {
        'Content-Type': undefined
      },
      transformRequest: angular.identity
    }).then(cb);
  }

});