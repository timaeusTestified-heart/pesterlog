const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // Позволяет подключаться с любого адреса (твоего GitHub Pages)
        methods: ["GET", "POST"]
    }
});

// Слушаем подключения
io.on('connection', (socket) => {
    console.log('Кто-то зашел в сеть!');

    // Когда пользователь заходит в чат
    socket.on('join', (data) => {
        // Рассылаем системное сообщение всем
        io.emit('system_msg', `-- ${data.handle} [${data.abbr}] начал доставать всех --`);
    });

    // Когда кто-то отправляет сообщение
    socket.on('send_msg', (data) => {
        // Пересылаем сообщение всем участникам
        io.emit('new_msg', data);
    });

    socket.on('disconnect', () => {
        console.log('Кто-то вышел');
    });
});

// Render сам назначит порт, если нет — используем 3000
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Сервер Достань Кореша запущен на порту ${PORT}`);
});
