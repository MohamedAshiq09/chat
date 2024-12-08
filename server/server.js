const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  
    methods: ["GET", "POST"],
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", ({ username }) => {
    users[socket.id] = username;
    console.log(`${username} joined.`);
    socket.broadcast.emit("user_joined", { username });
    socket.emit("online_users", Object.values(users));
  });

  socket.on("send_message", ({ to, message, from }) => {
    const recipientSocketId = Object.keys(users).find(
      (key) => users[key] === to
    );
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receive_message", { from, message });
    }
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    console.log(`${username} disconnected.`);
    io.emit("user_left", { username });
  });
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
