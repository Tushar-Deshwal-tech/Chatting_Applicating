const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const session = require('express-session');
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const connectDatabase = require('./DB');
const Users = require('./userModel');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware for sessions
const sessionMiddleware = session({
    secret: '943c59e9e2b210ef5a2b57b3ca45a0f664c8a27176acba32ec0e9a3d4927b1d1',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb+srv://tushardeshwal:nmo8pXRAfMpU4lLm@chating-application.d0tos.mongodb.net/" })
});

// Use session middleware
app.use(sessionMiddleware);
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// Serve static files
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDatabase();

// User registration endpoint
app.post('/register', async (req, res) => {
    const { username, password, email, number } = req.body;

    try {
        const existingUser = await Users.findOne({ email: email });
        if (existingUser) return res.status(400).send('User already exists.');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Users({ name: username, password: hashedPassword, email, number });
        await newUser.save();

        res.status(201).send('User registered successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Socket.IO login
io.on('connection', (socket) => {
    socket.on('login', async (data) => {
        const { username, password } = data;

        try {
            const userData = await Users.findOne({ name: username });
            if (userData && await bcrypt.compare(password, userData.password)) {
                socket.request.session.username = username;
                socket.request.session.save();
                socket.emit('login response', { success: true });
                io.emit('user status', { message: `${username} has joined the chat.` });
            } else {
                socket.emit('login response', { success: false, message: 'Incorrect username or password.' });
            }
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('logout user', (data) => {
        io.emit('user status', { message: `${data.username} has logged out.` });
        socket.request.session.destroy();
    });

    socket.on('retrieve messages', () => {
        socket.emit('message history', messages);
    });

    socket.on('chat message', (msg) => {
        messages.push(msg);
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        io.emit('user status', { message: 'A user has left the chat.' });
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(5000, () => {
    console.log('Server is running on port 5000!');
});
