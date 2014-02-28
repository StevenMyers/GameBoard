window.onload = function() {
	var socket = io.connect('http://localhost:3000');
  var player = $("#pid").text();
  var room = window.location.pathname.split("/")[2];
  
  // Connect the user
  socket.emit("connect", {pid: player, room: room});
  
  // Page functions
  $("#createDiv").click(function() {
    var game = $("#btn-value").text();
    if(game.indexOf('Select a game') != -1){
      $(this).effect("bounce");
    } else {
      console.log('emitting new game');
      socket.emit("new_game", {game: game, room: room});
    }
  });
  
  // Socket.io function
  socket.on('user:connect', function(user_count){
    $("#numPlayers").text(user_count);
  });
  socket.on('user:disconnect', function(user_count){
    $("#numPlayers").text(user_count);
  });
  socket.on('game:new', function(game_name){
    $("#board").html('<div>Created game: <b>' + game_name + '</b></div>');
  });
}
