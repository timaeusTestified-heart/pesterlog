const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

// статические файлы (HTML, CSS, JS)
app.use(express.static("public"));

// хранение пользователей и их настроения
let users = {};

io.on("connection", (socket) => {
  console.log("new user connected:", socket.id);

  // пользователь присоединился
  socket.on("join", (data) => {
    users[socket.id] = {
      name: data.name,
      color: data.color,
      mood: data.mood
    };
    io.emit("user list", Object.values(users));
  });

  // общий чат
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  // приватные сообщения
  socket.on("private message", (data) => {
    // ищем id получателя по имени
    const toSocketId = Object.keys(users).find(id => users[id].name === data.to);
    if(toSocketId) {
      socket.emit("private message", data); // отправляем себе
      io.to(toSocketId).emit("private message", data); // отправляем получателю
    }
  });

  // обновление настроения
  socket.on("update mood", (data) => {
    if(users[socket.id]){
      users[socket.id].mood = data.mood;
      io.emit("user list", Object.values(users));
    }
  });

  // отключение пользователя
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user list", Object.values(users));
    console.log("user disconnected:", socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});