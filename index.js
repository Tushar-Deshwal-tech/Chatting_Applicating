const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let messages = [];

app.use(express.static(path.resolve(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('login', (data) => {
        io.emit('user status', { message: `${data.username} has joined the chat.` });
    });

    socket.on('retrieve messages', (data) => {
        socket.emit('message history', messages);
    });

    socket.on('chat message', (msg) => {
        messages.push(msg);
        io.emit('chat message', msg);
    });

    socket.on('logout user', (data) => {
        io.emit('user status', { message: `${data.username} has logged out.` });
    });

    socket.on('disconnect', () => {
        io.emit('user status', { message: 'A user has left the chat.' });
        console.log(`User disconnected: ${socket.id}`);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(5000, () => {
    console.log('Server is running on port 5000!');
});
