const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let users = [];

io.on("connection", (socket) => {
  let currentUser = null;

  socket.on("join", (data) => {
    currentUser = data;
    users.push(currentUser);
    io.emit("user list", users);
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("private message", (msg) => {
    io.to(msg.to).emit("private message", msg);
    io.to(socket.id).emit("private message", msg);
  });

  socket.on("update mood", (data) => {
    if(currentUser) currentUser.mood = data.mood;
    io.emit("user list", users);
  });

  socket.on("disconnect", () => {
    if(currentUser){
      users = users.filter(u => u !== currentUser);
      io.emit("user list", users);
    }
  });
});

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));