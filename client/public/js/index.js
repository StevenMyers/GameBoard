window.onload = function() {
  $.slidebars();
  
	var socket = io.connect('http://localhost:3000');
  var pid = $('#username').text();
  
  var username = $.cookie('username');
  if(!username) {
    username = randomPlayerName();
    $.cookie('username', username);
  }
  $('#username').text(username);
  console.log(username);
  
  var slide = new $.slidebars();
  
  $('body').swiperight(function() {
    console.log("swiped");
    slide.open('left')
  });
  
  // Page functions
  $("#createBtn").click(function() {
    var message = {game: "pitch"}
    var customID = $('#customID').val();
    if(customID){
      message.room = customID;
    }
    console.log(message);
    socket.emit("game:new:request", message);
  });
  
  //Socket.io functionality
  socket.on('game:new:response', function(response){
    console.log(response);
  });
}


// script.
//   $(document).on("pageinit", "#content", function() {
//     var username = $.cookie('username');
//     if(!username) {
//       username = randomPlayerName();
//       $.cookie('username', username);
//     }
//     $('#username').text(username);
//     console.log(username);
//     $(document).on("swiperight", "#content", function(e) {
//       console.log("swiped");
//       if($.mobile.activePage.jqmData("panel") !== "open"){
//         $("#left-panel").panel("open");
//       }
//     });
//   });