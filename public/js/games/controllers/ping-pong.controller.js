(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .controller('pingPongController', function chatController($scope, socket) {

      var players = [];

      socket.on("game:init", function (data) {
        console.log(data);
        players = data;
      });

      socket.on("game:update", function (data) {
        $scope.updateCanvas(data);
      });

    })
})();