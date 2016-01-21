(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .controller('chatController', function chatController($scope, socket, $http, $timeout) {
      var newMessages = [];

      $scope.messages = [];
      $scope.participants = [];
      $scope.participantMenu = false;

      socket.on('connected', function () {
        socket.emit('handshake', window.token);
      });

      socket.on('handshake', function (data) {
        console.log("Connected!");
      });

      socket.on("disconnect", function (data) {
        console.log("Connection to server - lost");
      });

      socket.on('message', function (data) {
        $scope.messages.push(data);
        $timeout(function () {
          $(".chat-window").scrollTop($(".chat-window-content").height())
        });
      });

      socket.on('user:join', function (data) {
        console.log("User:join ", data);
        $scope.participants = data;
      });

      socket.on('user:leave', function (data) {
        console.log("User:leave ", data);
      });

      socket.on('message:sent', function (time) {
        var message = newMessages.pop();
        message.time = time;
        $scope.messages.push(message);
        // After the dom is updated - scroll down
        $timeout(function () {
          $(".chat-window").scrollTop($(".chat-window-content").height())
        });
      })

      socket.on('user:invitedYouToGame', function (user) {
        confirm("User " + user.name + " has invited you to game. Accept?");
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
        })
      };

      $scope.sendMessage = function (htmlForm) {
        var message = {
          message: $scope.newMessage,
          sender: {
            id: $scope.user.id,
            name: $scope.user.name,
            avatar: $scope.user.avatar
          }
        };
        newMessages.push(message);
        socket.emit("message", message);
        $scope.newMessage = "";
        return false;
      }

    });
})();