(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .controller('chatController', function chatController($scope, socket, $timeout) {

      var newMessages = [];

      $scope.messages = [];
      $scope.participants = [];
      $scope.participantMenu = false;

      socket.on('message', data => {
        $scope.messages.push(data);
        chatWindowScrollBottom();
      });

      socket.on('user:join', data => {
        $scope.participants = data;
      });

      socket.on('message:recieved', time => {
        var message = newMessages.pop();
        message.time = time;
        $scope.messages.push(message);
        chatWindowScrollBottom();
      })

      socket.on('user:invitedYouToGame', game => {
        if (confirm("User " + game.sender.name + " has invited you to game. Accept?")) {
          socket.emit('user:acceptGame', game);
        } else {
          socket.emit('user:refuseGame', game);
        }
      });

      socket.on('user:invitationRefused', user => {
        alert("User " + user.name + " refused your game invitation");
      });

      socket.on('user:getInGame', data => {
        window.location = "/game";
      });

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

      function chatWindowScrollBottom() {
        // Wait for the DOM update
        $timeout(() => {
          $(".chat-window").scrollTop($(".chat-window-content").height());
        });
      }

    });
})();