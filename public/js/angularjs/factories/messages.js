(function () {
  'use strict';

  angular
    .module('nodenecessities')
    .factory('socket', socket);

  function socket($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, cb) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            cb.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, cb) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (cb) {
              cb.apply(socket, args);
            }
          });
        })
      }
    }
  }
})();