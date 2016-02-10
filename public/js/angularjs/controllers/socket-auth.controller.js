(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .controller('socketAuthController', function chatController($scope, socket) {

      socket.on('connected', function () {
        socket.emit('handshake', window.token);
      });

      socket.on('handshake', data => {
        if (data.success) {
          console.log("Connected!");
        } else {
          console.log("Incorrect token");
        }
      });

      socket.on("disconnect", data => {
        console.log("Connection to server - lost");
      });

    })
})();