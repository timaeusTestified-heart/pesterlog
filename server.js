const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // все файлы в папке public

// хранение информации о пользователях
let users = {};

io.on('connection', (socket) => {
  // пользователь заходит
  socket.on('join', (data) => {
    users[socket.id] = {
      name: data.name,
      color: data.color,
      mood: data.mood
    };
    io.emit('user list', Object.values(users));
  });

  // системный чат
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });

  // приватный чат
  socket.on('private message', (data) => {
    for (let id in users) {
      if (users[id].name === data.to || users[id].name === data.from) {
        io.to(id).emit('private message', data);
      }
    }
  });

  // обновление настроения
  socket.on('update mood', (data) => {
    if (users[socket.id]) {
      users[socket.id].mood = data.mood;
      io.emit('user list', Object.values(users));
    }
  });

  // выход пользователя
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('user list', Object.values(users));
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});