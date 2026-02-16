const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(http, {
  cors: {
    origin: "*"
  }
});

const PORT = process.env.PORT || 3000;

// обязательно для render
app.use(express.static("public"));

let users = {};

// подключение
io.on("connection", (socket) => {

  // вход
  socket.on("join", (data) => {
    users[socket.id] = {
      name: data.name,
      color: data.color,
      mood: data.mood
    };

    io.emit("user list", Object.values(users));
  });

  // общий чат
  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });

  // приватные сообщения
  socket.on("private message", (data) => {
    const targetId = Object.keys(users).find(
      id => users[id].name === data.to
    );

    if (targetId) {
      io.to(targetId).emit("private message", data);
      socket.emit("private message", data);
    }
  });

  // обновление настроения
  socket.on("update mood", (data) => {
    if (users[socket.id]) {
      users[socket.id].mood = data.mood;
      io.emit("user list", Object.values(users));
    }
  });

  // отключение
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user list", Object.values(users));
  });

});

http.listen(PORT, () => {
  console.log("server running on port " + PORT);
});