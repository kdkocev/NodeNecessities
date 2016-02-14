(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .controller('pingPongController', function ($scope, socket) {

      socket.on("game:update", function (data) {
        console.log("game:update");
        $scope.syncData(data);
      })

      socket.on("game:playerMove", function (data) {
        $scope.userMoved(data);
      })

    })
})();