(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .directive("chatParticipant", function (socket, $rootScope) {

      return {
        restrict: 'E',
        replace: true,
        templateUrl: '/js/angularjs/views/chat-participants.html',
        scope: {
          participant: "=data"
        },
        link: function (scope, element, attrs) {

          if ($rootScope.user.email === scope.participant.email) {
            scope.participant.me = true;
          }
          scope.inviteToGame = function (user) {
            $rootScope.inviteToGame(user);
          }

        }
      }
    })
})();