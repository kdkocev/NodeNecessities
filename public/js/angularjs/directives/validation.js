(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .directive("validation", function (socket, $rootScope, $compile) {

      return {
        require: "^form",
        restrict: 'E',
        replace: true,
        scope: {
          'name': "=name"
        },
        templateUrl: '/js/angularjs/views/validation.html',
        link: function (scope, element, attrs, ctrl) {
          scope.field = ctrl[attrs.name];
        }
      }
    })
})();