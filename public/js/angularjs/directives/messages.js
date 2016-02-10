(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .directive("message", function (socket, $rootScope) {

      return {
        restrict: 'E',
        replace: true,
        templateUrl: '/js/angularjs/views/messages.html',
        scope: {
          message: "=data"
        },
        link: function (scope, element, attrs) {

          if ($rootScope.user.id === scope.message.sender.id) {
            scope.message.myMessage = true;
          }

        }
      }
    })
})();