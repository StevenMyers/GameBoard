
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Routes
app.get('/', routes.index);
app.get('/b/*', routes.board);

// Create Server
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'));

// Socke.io
io.sockets.on('connection', function (socket) {
  // User joins a room
  socket.on('connect', function (data) {
    joinRoom(socket, data.room);
  });
  // User leaves a room
  socket.on('disconnect', function () {
    disconnect(socket);
  });
  // User creates the game
  socket.on('new_game', function (data) {
    io.sockets.in(data.room).emit("game:new", data.game);
  });
});

/**
 * Functions for socket actions
 */ 

// Join a socket to a room
function joinRoom(socket, room) {
  socket.join(room);
  // Count the number of connected users to the room
  var active_connections = io.sockets.manager.rooms['/' + room].length;
  io.sockets.in(room).emit("user:connect", active_connections);
}

function disconnect(socket) {
  console.log("Disconnect called");
  // Get a list of rooms for the client
  var rooms = io.sockets.manager.roomClients[socket.id];

  // Unsubscribe from the rooms
  for(var room in rooms) {
    if(room && rooms[room]) {
      leaveRoom(socket, room.replace('/',''));
    }
  }
}

function leaveRoom(socket, room) {
  socket.leave(room);
  // Broadcast to room the new user count
  if (io.sockets.manager.rooms['/' + room]) {
    var active_connections = io.sockets.manager.rooms['/' + room].length;
    io.sockets.in(room).emit('user:disconnect', active_connections);
  } else {
    // No more users in the room, cleanup
  }
}