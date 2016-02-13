(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .controller('pingPongController', function chatController($scope, socket) {

      //DEPRECATED
      socket.on("game:start", function (data) {
        console.log("game:start", data);
      });

      socket.on("game:update", function (data) {
        console.log("game:update");
        $scope.syncData(data);
      })

      socket.on("game:playerMove", function (data) {
        $scope.userMoved(data);
      })

    })
})();