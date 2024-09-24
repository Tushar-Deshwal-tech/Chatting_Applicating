const socket = io();

function pageHandle() {
    const loginPresent = document.querySelector('.login-parent');
    loginPresent.classList.toggle('flipped');
}


function authenticateUser() {
    const loginUsername = document.getElementById("login-username").value;
    const loginPassword = document.getElementById("login-password").value;

    const inputElements = document.querySelector(".input-fields");
    const aboveElement = document.getElementById("login-username");

    clearErrors();
    EmptyInput();

    if (!validateEmail(loginUsername)) {
        errorMessage = "Please Enter a Valid Email Id!";
        showError(inputElements, aboveElement, errorMessage);
        return;
    }

    socket.emit('login', { username: loginUsername, password: loginPassword });

    socket.on('login response', (response) => {
        if (response.success) {
            // localStorage.setItem('authSuccess', 'true');
            // localStorage.setItem('username', loginUsername);
            // localStorage.setItem('loginTimestamp', new Date().getTime() + (24 * 60 * 60 * 1000));
            // window.location.href = 'messageBox.html';
            console.log("user is login")
        } else {
            showError(inputElements, emailElement, response.message);
        }
    });
}

function registerUser() {
    const name = document.getElementById('signup-name').value;
    const number = document.getElementById('signup-number').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;



    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: name, password, email, number })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            pageHandle(); // Switch back to login
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration failed.');
    });
}




function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateNumber(number) {
    return number.length === 10;
}

function validatePassword(password) {
    const hasSpecialChar = /[!@#$%^&*()]/.test(password);
    const isValidLength = password.length >= 6;
    return hasSpecialChar && isValidLength;
}




function showError(mainElement, beforeElement, errorMessage) {
    const errordiv = document.createElement("div");
    errordiv.textContent = errorMessage;
    errordiv.classList.add("errorMessage");
    mainElement.insertBefore(errordiv, beforeElement);
}

function clearErrors() {
    const existingErrors = document.querySelectorAll('.errorMessage');
    existingErrors.forEach(error => error.remove());
}

function EmptyInput() {
    const inputs = document.querySelectorAll(".input-fields input");
    inputs.forEach(input => {
        input.value = "";
    });
}


document.querySelectorAll('.input-fields input').forEach(inputElement => {
    inputElement.addEventListener('keydown', () => {
        clearErrors();
    });
});
