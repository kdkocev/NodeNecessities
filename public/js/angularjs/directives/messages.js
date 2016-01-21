(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .directive("message", function (socket, $rootScope) {

      return {
        restrict: 'E',
        replace: true,
        scope: {
          message: '=data'
        },
        templateUrl: '/js/angularjs/views/messages.html',
        link: function (scope, element, attrs) {}
      }
    })
})();