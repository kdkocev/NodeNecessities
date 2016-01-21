(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .controller('chatController', function chatController($scope, socket, $http) {

      $scope.messages = [];

      socket.on('connected', function () {
        socket.emit('handshake', window.token);
      });

      socket.on('handshake', function (data) {
        // window.user = data.user;
      });

      socket.on("disconnect", function (data) {
        console.log("Connection to server - lost");
      });

      socket.on('message', function (data) {
        console.log(data);
        $scope.messages.push(data);
      });

      socket.on('user:join', function (data) {
        console.log("User:join ", data);
      });

      socket.on('user:leave', function (data) {
        console.log("User:leave ", data);
      });

      $scope.uploadFile = function (files) {
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
        }).success(function (data) {
          $scope.user.avatar = data.avatar;
        }).error(function (err) {

        });
      };

    });
})();