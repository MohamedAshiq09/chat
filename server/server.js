const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Set up Express app
const app = express();
app.use(cors());
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"]
  }
});

// Object to store active users
const users = {}; 

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', ({ username }) => {
    users[socket.id] = username;
    socket.broadcast.emit('user_joined', { username });
  });

  // Handle sending messages
  socket.on('send_message', ({ to, message, from }) => {
    const targetSocketId = Object.keys(users).find(key => users[key] === to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('receive_message', { message, from });
    }
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    socket.broadcast.emit('user_left', { username });
  });
});

// Start server
server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
