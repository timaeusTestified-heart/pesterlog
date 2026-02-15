const io = require('socket.io')(server);
let users = {};

io.on('connection', socket=>{
  socket.on('join', data=>{
    users[socket.id] = {name:data.name,color:data.color,mood:data.mood};
    io.emit('user list', Object.values(users));
  });

  socket.on('chat message', data=>{
    io.emit('chat message', data);
  });

  // приватные сообщения
  socket.on('private message', data=>{
    for(let id in users){
      if(users[id].name===data.to || users[id].name===data.from){
        io.to(id).emit('private message', data);
      }
    }
  });

  // обновление настроения
  socket.on('update mood', data=>{
    if(users[socket.id]) users[socket.id].mood = data.mood;
    io.emit('user list', Object.values(users));
  });

  socket.on('disconnect', ()=>{
    delete users[socket.id];
    io.emit('user list', Object.values(users));
  });
});      io.to(recipient).emit("private message", {from, to, message, color});
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
