const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Разрешаем доступ с твоего GitHub
});

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('join', (data) => {
        socket.broadcast.emit('system_msg', `-- ${data.handle} [${data.abbr}] began pestering everyone --`);
    });

    socket.on('send_msg', (data) => {
        io.emit('new_msg', data); // Рассылаем всем
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
