let userData = [
    {
        name: "user1",
        number: 9874123650,
        email: "user1@gmail.com",
        password: "user1@123"
    },
    {
        name: "user2",
        number: 9876543210,
        email: "user2@gmail.com",
        password: "user2@123"
    }
];

function pageHandle() {
    const loginPresent = document.querySelector('.login-parent');
    loginPresent.classList.toggle('flipped');
}

function authenticateUser() {
    const loginEmail = document.getElementById("login-username").value;
    const loginPassword = document.getElementById("login-password").value;

    const inputElements = document.querySelector(".input-fields");
    const emailElement = document.getElementById("login-username");
    const passwordElement = document.getElementById("login-password");

    clearErrors();
    EmptyInput();
    let emailError = null;
    let passwordError = null;

    if (!validateEmail(loginEmail)) {
        emailError = "Please Enter a Valid Email Id!";
        showError(inputElements, emailElement, emailError);
        return;
    }

    const user = userData.find(user => user.email === loginEmail);

    if (!user) {
        emailError = "Email does not exist!";
        showError(inputElements, emailElement, emailError);
        return;
    }

    if (user.password !== loginPassword) {
        passwordError = "Password is incorrect!";
        showError(inputElements, emailElement, passwordError);
        return;
    }

    if (!emailError && !passwordError) {
        const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem('authSuccess', 'true');
        localStorage.setItem('username', user.name);
        localStorage.setItem('loginTimestamp', expirationTime);
        window.location.href = 'messageBox.html';
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
