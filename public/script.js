const socket = io();

function openMessageBox() {
    socket.emit('login', {id: socket.id});
    const messages = document.querySelector('.messages')
    window.location.href = 'messageBox.html';
}

function sendMessage() {
    const userInputMessage = document.querySelector("#userInputMessage");
    const newTime = getTime();
    if (userInputMessage.value) {
        socket.emit('chat message', { id: socket.id, message: userInputMessage.value, time: newTime });
        userInputMessage.value = '';
    }
};
socket.on('chat message', (msg) => {
    const messages = document.querySelector('.messages');
    const isActiveUser = msg.id === socket.id;
    const messageSection = createMessagesSection(isActiveUser);

    messageSection.querySelector('.username').textContent = isActiveUser ? "You" : msg.id;
    messageSection.querySelector('.usermessage').textContent = msg.message;
    messageSection.querySelector('.usertime').textContent = msg.time;
    console.log(messageSection)
    messages.appendChild(messageSection);
    messages.scrollTop = messages.scrollHeight;

});

function createMessagesSection(isActiveUser) {
    const messageSection = document.createElement("div");
    messageSection.classList.add('message_section');

    const username = document.createElement("div");
    username.classList.add('username');

    if (isActiveUser) {
        messageSection.classList.add('activeuser');
    }

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
};


function logout() {
    socket.emit('logout user');
    socket.disconnect();
    window.location.href = 'index.html';
};


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