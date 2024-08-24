const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const path = require('path');
const io = new Server(server)


app.use(express.static(path.resolve(__dirname, 'public')));

io.on('connection', (socket) =>{
    
    socket.on('chat message', (msg) =>{
        io.emit('chat message', msg);
        console.log(msg)
    });

    socket.on('login', () =>{
        console.log("A new user is login")
    });

    socket.on('logout user', () =>{
        console.log("user is logout")
        socket.disconnect();
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(5000, () => {
    console.log('Application is running on port 5000!');
});
