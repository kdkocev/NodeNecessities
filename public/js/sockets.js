$(function () {
  var socket = io.connect();
  socket.on('connected', function () {
    socket.emit('handshake', window.token);
  });
  socket.on('handshake', function (data) {
    window.user = data.user;
    console.log(data);
  });
  socket.on('message', function (data) {
    console.log(data);
    $(".chat-window").append(display_message(data.message, data.sender));
    console.log(data);
  });

  socket.on("disconnect", function (data) {
    console.log("some shit happened");
  });

  $("form").submit(function (e) {
    e.preventDefault();
    var message = $("#message-input").val();
    send(message);
    $(".chat-window").append(display_message(message, user.email));
    $("#message-input").val("");
  });

  function send(text) {
    socket.emit('message', text);
  }

  // Forgive me father, for I have sinned:
  function display_message(text, sender) {
    return '<div class="message">' +
      '<div class="sender-avatar">' +
      '<img src="">' +
      '</div>' +
      '<div class="text">' +
      '<div class="sender-name">' +
      (sender) +
      '</div>' + text +
      '</div>';
  }
  // TODO: use angular next time

});