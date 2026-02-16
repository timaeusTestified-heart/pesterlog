const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        io.emit('system_msg', `-- ${data.handle} [${data.abbr}] начал доставать всех --`);
    });
    socket.on('send_msg', (data) => {
        io.emit('new_msg', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
