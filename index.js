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
const Message = require('./messageModel');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'static')));

// Middleware for sessions
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL })
});

// Use session middleware
app.use(sessionMiddleware);
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDatabase();

// User registration endpoint
app.post('/register', async (req, res) => {
    const { username, password, email, number } = req.body;
    try {
        const existingEmail = await Users.findOne({ email });
        const existingNumber = await Users.findOne({ number });

        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }

        if (existingNumber) {
            return res.status(400).json({ success: false, message: 'Number already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Users({ name: username, password: hashedPassword, email, number });
        await newUser.save();
        return res.status(200).json({ success: true, message: 'User registered successfully.' });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});



// Socket.IO login
io.on('connection', (socket) => {
    socket.on('login', async (data) => {
        const { useremail, password } = data;
        try {
            const userData = await Users.findOne({ email: useremail });
            if (!userData) {
                socket.emit('login response', { success: false, message: 'Email is not registered, Please signup first!' });
                return;
            }
            if (await bcrypt.compare(password, userData.password)) {
                const username = userData.name;
                socket.request.session.username = username;
                socket.request.session.save();
                socket.emit('login response', { success: true, username });
            } else {
                socket.emit('login response', { success: false, message: 'Incorrect Password, Please Try Again!' });
            }
        } catch (error) {
            console.error(error);
            socket.emit('login response', { success: false, message: 'Server error' });
        }
    });

    socket.on('chat message', async (data) => {
        try {
            const newMessage = new Message({ name: data.name, message: data.message, time: data.time});
            const savedMessage = await newMessage.save();
            const messageData = {
                name: savedMessage.name,
                message: savedMessage.message,
                time: savedMessage.time
            };
    
            io.emit('display message', messageData);
        } catch (error) {
            console.error(error);
        }
    });
    

    socket.on('logout user', (data) => {
        console.log(`${data.username} has logged out.`)
        // io.emit('user status', { message: `${data.username} has logged out.` });
        socket.request.session.destroy();
    });

    socket.on('retrieve messages', async () => {
        try {
            const messages = await Message.find({}).sort({ createdAt: -1 });
            socket.emit('all messages', messages);
        } catch (error) {
            console.error('Error retrieving messages:', error);
        }
    });


    socket.on('clear Database', async () =>{
        try {
            await Users.deleteMany({});
            console.log('Old users removed successfully.');
        } catch (error) {
            console.error('Error removing old users:', error);
        }
    })

    socket.on('clear Message Database', async () =>{
        try {
            await Message.deleteMany({});
            console.log('Old Message removed successfully.');
        } catch (error) {
            console.error('Error removing old Message:', error);
        }
    })
});

server.listen(3000, () => {
    console.log('Server is running on port 3000!');
});
