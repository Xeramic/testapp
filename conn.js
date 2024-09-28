const express = require('express');
const http = require('http');
const SocketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = SocketIO(server, {
    cors: {
        origin: '*',
      }
});
io.on('connection', (socket) => {
    
    console.log('A user connected');

    socket.on('messageSended', (data) => {
        // Отправляем событие всем подключенным клиентам
        io.emit('eventTriggered', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});