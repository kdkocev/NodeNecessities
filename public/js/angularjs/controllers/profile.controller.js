(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .controller('profileController', function chatController($scope, socket) {

      $scope.uploadFile = function (fileData) {
        $scope.$root.uploadFile(fileData, function (data) {
          $scope.user.avatar = data.data.avatar;
        });
      }

    })
})();