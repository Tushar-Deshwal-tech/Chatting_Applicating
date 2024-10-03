const socket = io();

function pageHandle() {
    const loginPresent = document.querySelector('.login-parent');
    loginPresent.classList.toggle('flipped');
    checkVisiblePage();
    clearLoginInputs();
    clearSignupInputs();
    clearErrors();
}

function authenticateUser() {
    const loginUsername = document.getElementById("login-useremail").value;
    const loginPassword = document.getElementById("login-password").value;

    const inputElements = document.querySelector(".input-fields");
    const aboveElement = document.getElementById("login-useremail");

    clearErrors();
    clearLoginInputs();
    if (loginUsername === "" || loginPassword === "") {
        showError(inputElements, aboveElement, "Please fill in all fields.");
        checkLoginErrorMessage()
        return;
    }

    if (!validateEmail(loginUsername)) {
        const errorMessage = "Please Enter a Valid Email Id!";
        showError(inputElements, aboveElement, errorMessage);
        checkLoginErrorMessage()
        return;
    }

    socket.emit('login', { useremail: loginUsername, password: loginPassword });

    socket.on('login response', (response) => {
        if (response.success) {
            localStorage.setItem('authSuccess', 'true');
            localStorage.setItem('username', loginUsername);
            localStorage.setItem('loginTimestamp', new Date().getTime() + (24 * 60 * 60 * 1000));
            window.location.href = 'chating.html';
        } else {
            showError(inputElements, aboveElement, response.message);
            checkLoginErrorMessage()
        }
    });
}

function checkUserDetails() {
    const name = document.getElementById('signup-name').value;
    const number = document.getElementById('signup-number').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const inputElements = document.querySelector(".signup-input-fields");
    const aboveElement = document.getElementById("signup-name");

    clearErrors();
    clearSignupInputs();
    if (name === "" || number === "" || email === "" || password === "") {
        showError(inputElements, aboveElement, "Please fill in all fields.");
        checkSignupErrorMessage();
        return;
    }

    if (!validateNumber(number) && !validateEmail(email)) {
        const errorMessage = "Please Enter a Valid Email Or Number!";
        showError(inputElements, aboveElement, errorMessage);
        checkSignupErrorMessage();
        return;
    }
    if (!validateNumber(number)) {
        const errorMessage = "Please Enter a Valid Mobile Number!";
        showError(inputElements, aboveElement, errorMessage);
        checkSignupErrorMessage();
        return;
    }
    if (!validateEmail(email)) {
        const errorMessage = "Please Enter a Valid Email Id!";
        showError(inputElements, aboveElement, errorMessage);
        checkSignupErrorMessage();
        return;
    }
    const passwordError = validatePassword(password);
    if (passwordError !== true) {
        showError(inputElements, aboveElement, passwordError);
        checkSignupErrorMessage();
        return;
    }
    registerUser(name, password, email, number);
}

function registerUser(name, password, email, number) {
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: name, password, email, number })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                pageHandle();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Registration failed. Please try again later.');
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
    const hasNumber = /\d/.test(password);
    const isValidLength = password.length >= 6;

    if (!isValidLength) {
        return "Password must be at least 6 characters long.";
    }
    if (!hasSpecialChar) {
        return "Password must contain at least one special character (!@#$%^&*()).";
    }
    if (!hasNumber) {
        return "Password must contain at least one number.";
    }

    return true;
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

document.querySelectorAll('.input-fields input, .signup-input-fields input').forEach(inputElement => {
    inputElement.addEventListener('input', () => {
        clearErrors();
        checkLoginErrorMessage()
    });
});
document.querySelectorAll('.signup-input-fields input').forEach(inputElement => {
    inputElement.addEventListener('input', () => {
        clearErrors();
        checkSignupErrorMessage()
    });
});

function checkVisiblePage() {
    const loginParent = document.querySelector('.login-parent');
    if (loginParent.classList.contains('flipped')) {
        document.querySelector('.login-child').style.minHeight = "55vh";
    } else {
        document.querySelector('.login-child').style.minHeight = "42vh";
    }
}

function checkLoginErrorMessage() {
    const errorMessage = document.querySelector('.errorMessage');
    if (errorMessage) {
        document.querySelector('.login-child').style.minHeight = "50vh";
    } else {
        document.querySelector('.login-child').style.minHeight = "42vh";
    }
}

function checkSignupErrorMessage() {
    const errorMessage = document.querySelector('.errorMessage');
    if (errorMessage) {
        document.querySelector('.login-child').style.minHeight = "62vh";
    } else {
        document.querySelector('.login-child').style.minHeight = "55vh";
    }
}

function clearLoginInputs() {
    const login_inputs = document.querySelectorAll(".input-fields input");
    login_inputs.forEach(input => {
        input.value = "";
    });
}

function clearSignupInputs() {
    const signup_inputs = document.querySelectorAll(".signup-input-fields input");
    signup_inputs.forEach(input => {
        input.value = "";
    });
}