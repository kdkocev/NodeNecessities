(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .directive("chatParticipant", function (socket, $rootScope) {
      console.log("v igrata sme ")
      return {
        restrict: 'E',
        replace: true,
        templateUrl: '/js/angularjs/views/chat-participants.html',
        scope: {
          participant: "=data"
        },
        link: function (scope, element, attrs) {
          console.log(scope.participant);
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