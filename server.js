const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

// все пользователи
let users = {}; // socket.id -> {name, color}

// приватные чаты
let privateChats = {}; // "Alice|Bob" -> [{from, to, message, color}]

io.on("connection", (socket) => {

  // когда пользователь заходит
  socket.on("join", (user) => {
    users[socket.id] = user;
    io.emit("user list", Object.values(users));
  });

  // общий чат
  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });

  // приватный чат
  socket.on("private message", (data) => {
    const {from, to, message, color} = data;
    const key = [from, to].sort().join("|");
    if (!privateChats[key]) privateChats[key] = [];
    privateChats[key].push({from, to, message, color});

    // отправка получателю
    const recipient = Object.keys(users).find(id => users[id].name === to);
    if (recipient) {
      io.to(recipient).emit("private message", {from, to, message, color});
    }

    // отправка обратно отправителю (чтобы его чат обновился)
    socket.emit("private message", {from, to, message, color});
  });

  // пользователь вышел
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user list", Object.values(users));
  });

});

http.listen(3000, () => console.log("server started"));
