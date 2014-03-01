/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongo = require('mongodb');
var db = require('monk')('http://localhost:27017/gamesDB');
var gamesDB = db.get("games");
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
app.use(express.static(path.join(__dirname, 'public')));

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
    joinRoom(socket, data);
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
function joinRoom(socket, data) {
  console.log(data.room);
  socket.join(data.room);
  // Count the number of connected users to the room
  var active_connections = io.sockets.manager.rooms['/' + data.room].length;
  io.sockets.in(data.room).emit("user:connect", active_connections);

  // Update the games database
  gamesDB.findById(data.room, function(err, result) {
    if(!result) {
      // No entry create one
      gamesDB.insert({
        _id : data.room,
        players : [{pid : data.pid, socket: socket.id}]
      });
    } else {
      // result found, update it
      var newPlayers = result.players;
      newPlayers.push({pid : data.pid, socket: socket.id});
      gamesDB.updateById(data.room, { players : newPlayers });
    }
  });  
}

function disconnect(socket) {
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
  }
  
  // Leave the database
  leaveDatabase(socket, room);
}

function leaveDatabase(socket, room) {
  // Remove from database
  gamesDB.findById(room, function(err, result) {
    if(result) {
      // result found, update it
      var newPlayers = result.players;
      
      // If we are the last player delete the data
      if(newPlayers.length == 1) {
        gamesDB.remove({_id: room});
      } else {
        for(var i=0; i<newPlayers.length; i++){
          if(newPlayers[i].socket.match(socket.id)) {
            newPlayers.splice(i,1);
            break;
          }
        }
        gamesDB.updateById(room, { players : newPlayers });
      }
    }
  }); 
}