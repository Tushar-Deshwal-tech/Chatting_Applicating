document.addEventListener('DOMContentLoaded', () => {
    const authSuccess = localStorage.getItem('authSuccess');
    const username = localStorage.getItem('username');
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    
    const now = new Date().getTime();
    const oneDayInMillis = 24 * 60 * 60 * 1000;

    if (authSuccess && username && loginTimestamp) {
        if (now < parseInt(loginTimestamp, 10) + oneDayInMillis) {
            openMessageBox(username);
        } else {
            clearAuthData();
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
});

let socket;

function initializeSocket() {
    if (!socket) {
        socket = io();

        socket.on('user status', (data) => {
            createUserStatus(data.message);
        });

        socket.on('chat message', (msg) => {
            displayMessage(msg);
        });
        
        socket.on('message history', (messages) => {
            messages.forEach(msg => displayMessage(msg));
        });
    }
}

function openMessageBox(username) {
    initializeSocket();
    socket.emit('login', { id: socket.id, username: username });

    socket.emit('retrieve messages', { username: username });
}

function createUserStatus(message) {
    const messages = document.querySelector('.messages');
    const userStatus = document.createElement("div");
    userStatus.classList.add("userStatus");
    userStatus.textContent = message;
    messages.appendChild(userStatus);
    messages.scrollTop = messages.scrollHeight;
}

function displayMessage(msg) {
    const messages = document.querySelector('.messages');
    const messageSection = createMessagesSection();

    messageSection.querySelector('.username').textContent = msg.username;
    messageSection.querySelector('.usermessage').textContent = msg.message;
    messageSection.querySelector('.usertime').textContent = msg.time;

    messages.appendChild(messageSection);
    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    if (socket) {
        const userInputMessage = document.querySelector("#userInputMessage");
        const newTime = getTime();
        const username = localStorage.getItem('username');
        if (userInputMessage.value.trim()) {
            socket.emit('chat message', { id: socket.id, username: username, message: userInputMessage.value, time: newTime });
            userInputMessage.value = '';
        }
    }
}

function createMessagesSection() {
    const messageSection = document.createElement("div");
    messageSection.classList.add('message_section');

    const username = document.createElement("div");
    username.classList.add('username');

    const messageTime = document.createElement("div");
    messageTime.classList.add('messageTime');

    const usermessage = document.createElement("div");
    usermessage.classList.add('usermessage');

    const newTime = document.createElement("div");
    newTime.classList.add('usertime');

    messageTime.appendChild(usermessage);
    messageTime.appendChild(newTime);
    messageSection.appendChild(username);
    messageSection.appendChild(messageTime);

    return messageSection;
}

function logout() {
    if (socket) {
        const username = localStorage.getItem('username');
        socket.emit('logout user', { username: username });
    }
    clearAuthData();
    window.location.href = 'index.html';
}

function clearAuthData() {
    localStorage.removeItem('authSuccess');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTimestamp');
}

function getTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const isPM = hours >= 12;
    hours = hours % 12;
    hours = hours || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const period = isPM ? 'PM' : 'AM';
    return `${hours}:${formattedMinutes} ${period}`;
}
