document.addEventListener('DOMContentLoaded', () => {
    const authSuccess = localStorage.getItem('authSuccess');
    const username = localStorage.getItem('username');
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    
    const now = new Date().getTime();
    const oneDayInMillis = 24 * 60 * 60 * 1000;

    const isPageReload = sessionStorage.getItem('pageReloaded');
    if (authSuccess && username && loginTimestamp) {
        if (now < parseInt(loginTimestamp, 10) + oneDayInMillis) {
            initializeSocket();
            socket.emit('retrieve messages')
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

        socket.on('user joined', (data) => {
            userJoined(data.message);
            console.log(data.message)
        });

        socket.on('display message', (data) => {
            userMessage(data);
        });

        socket.on('all messages', (messages) => {
            messages.forEach((message) => {
                userMessage(message);
            });
        });
    }
}

function userJoined(message) {
    const messageSection = document.querySelector('.messageSection');
    const userConnectedDiv = document.createElement("div");
    userConnectedDiv.classList.add("userConnected");
    userConnectedDiv.textContent = message;
    messageSection.appendChild(userConnectedDiv);
}

function sendMessage() {
    if (socket) {
        const userInputMessage = document.querySelector("#userInputMessage");
        const username = localStorage.getItem('username');
        if (userInputMessage.value.trim()) {
            const messageData = {
                name: username,
                message: userInputMessage.value,
                time: new Date().getTime()
            };
            socket.emit('chat message', messageData);
            userInputMessage.value = '';
        }
    }
}

function createUserMessageDiv() {
    const userMessageDiv = document.createElement("div");
    userMessageDiv.classList.add('userMessage');

    const userName = document.createElement("div");
    userName.classList.add('userName');

    const messageTime = document.createElement("div");
    messageTime.classList.add('messageTime');

    const message = document.createElement("div");
    message.classList.add('message');

    const time = document.createElement("div");
    time.classList.add('time');

    messageTime.appendChild(message);
    messageTime.appendChild(time);
    userMessageDiv.appendChild(userName);
    userMessageDiv.appendChild(messageTime);

    return userMessageDiv;
}

function userMessage(data) {
    const messageSection = document.querySelector('.messageSection');
    const createUserMessageDivInstance = createUserMessageDiv();

    createUserMessageDivInstance.querySelector('.userName').textContent = data.name;
    createUserMessageDivInstance.querySelector('.message').textContent = data.message;
    createUserMessageDivInstance.querySelector('.time').textContent = new Date(data.time).toLocaleTimeString();

    messageSection.appendChild(createUserMessageDivInstance);
    messageSection.scrollTop = messageSection.scrollHeight;
    activeuserOrnot(createUserMessageDivInstance, data.name);
}

function activeuserOrnot(userMessageDiv, name) {
    const localstoragename = localStorage.getItem('username');
    if (localstoragename === name) {
        userMessageDiv.classList.add('activeUser');
    }
}

function logoutUser() {
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
