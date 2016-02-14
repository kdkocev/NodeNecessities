(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .controller('stackAttackController', function ($scope, socket) {

      socket.on("game:update", function (data) {
        console.log("game:update");
        // $scope.syncData(data);
      })

      // When the other player moves. This can be recieved on game:update instead
      // socket.on("game:playerMove", function (data) {
      //   $scope.userMoved(data);
      // })

    })
})();