const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // Это критически важно, чтобы GitHub мог подключиться
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Пользователь вошел');

    socket.on('join', (data) => {
        // Уведомление о входе на русском
        io.emit('system_msg', `-- ${data.handle} [${data.abbr}] начал доставать всех --`);
    });

    socket.on('send_msg', (data) => {
        io.emit('new_msg', data);
    });

    socket.on('disconnect', () => {
        console.log('Пользователь вышел');
    });
});

// Render сам подставит нужный порт
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
