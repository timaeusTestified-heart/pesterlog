const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// хранилище пользователей
let users = {};

app.use(express.static('public'));

// при подключении сокета
io.on('connection', socket => {

  // когда пользователь присоединяется
  socket.on('join', data => {
    users[socket.id] = { name: data.name, color: data.color, mood: data.mood };
    io.emit('user list', Object.values(users));
  });

  // обновление цвета
  socket.on('update color', data => {
    if(users[socket.id]){
      users[socket.id].color = data.color;
      io.emit('user list', Object.values(users));
    }
  });

  // обновление настроения
  socket.on('update mood', data => {
    if(users[socket.id]){
      users[socket.id].mood = data.mood;
      io.emit('user list', Object.values(users));
    }
  });

  // общий чат
  socket.on('chat message', data => {
    io.emit('chat message', data);
  });

  // приватные сообщения
  socket.on('private message', data => {
    // ищем сокет того, кому пишут
    for(let id in users){
      if(users[id].name === data.to){
        io.to(id).emit('private message', data);
        break;
      }
    }
    // отправляем отправителю тоже, чтобы отображалось
    socket.emit('private message', data);
  });

  // отключение
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('user list', Object.values(users));
  });
});

http.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});