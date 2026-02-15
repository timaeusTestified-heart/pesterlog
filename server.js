const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public")); // отдаём index.html и все файлы из public/

let users = []; // список подключенных пользователей

io.on("connection", (socket) => {

  // когда клиент присоединяется
  socket.on("join", (data) => {
    socket.nickname = data.name;
    socket.color = data.color;
    socket.mood = data.mood;
    users.push(socket);
    updateUserList();
  });

  // системные сообщения (общий чат)
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); // всем подключенным
  });

  // приватные сообщения
  socket.on("private message", (msg) => {
    const toSocket = users.find(u => u.nickname === msg.to);
    if(toSocket) toSocket.emit("private message", msg);
    socket.emit("private message", msg); // отправляем себе тоже
  });

  // обновление настроения
  socket.on("update mood", (data) => {
    socket.mood = data.mood;
    updateUserList();
  });

  // отключение пользователя
  socket.on("disconnect", () => {
    users = users.filter(u => u !== socket);
    updateUserList();
  });

  function updateUserList() {
    const list = users.map(u => ({name:u.nickname, color:u.color, mood:u.mood}));
    users.forEach(u => u.emit("user list", list));
  }
});

// порт Render или 3000 локально
http.listen(process.env.PORT || 3000, () => console.log("server running"));