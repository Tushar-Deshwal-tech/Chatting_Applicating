// Initialize socket connection
const socket = io();

// Toggles between login and signup pages.
function pageHandle() {
    const loginPresent = document.querySelector('.login-parent');
    loginPresent.classList.toggle('flipped');
    checkVisiblePage();
    clearLoginInputs();
    clearSignupInputs();
    clearErrors();
}

// --------------------- Login Section ---------------------

// Authenticates the user with provided credentials.
function authenticateUser() {
    const loginUsername = document.getElementById("login-useremail").value;
    const loginPassword = document.getElementById("login-password").value;
    const inputElements = document.querySelector(".login-heading");

    clearErrors();
    clearLoginInputs();

    // Check for empty fields
    if (loginUsername === "" || loginPassword === "") {
        showError(inputElements, "Please fill in all fields.");
        checkLoginErrorMessage();
        return;
    }

    // Validate email format
    if (!validateEmail(loginUsername)) {
        const errorMessage = "Please Enter a Valid Email Id!";
        showError(inputElements, errorMessage);
        checkLoginErrorMessage();
        return;
    }

    // Emit login event
    socket.emit('login', { useremail: loginUsername, password: loginPassword });

    // Listen for login response
    socket.on('login response', (response) => {
        if (response.success) {
            localStorage.setItem('authSuccess', 'true');
            localStorage.setItem('username', response.username);
            localStorage.setItem('loginTimestamp', new Date().getTime() + (24 * 60 * 60 * 1000));
            window.location.href = 'chating.html';
        } else {
            showError(inputElements, response.message);
            checkLoginErrorMessage();
        }
    });
}

// Clears input fields in the login form.
function clearLoginInputs() {
    const login_inputs = document.querySelectorAll(".login-input-fields input");
    login_inputs.forEach(input => {
        input.value = "";
    });
}

// Checks for login error messages and adjusts the height of the login section.
function checkLoginErrorMessage() {
    const errorMessage = document.querySelector('.errorMessage');
    if (errorMessage) {
        document.querySelector('.login-child').style.minHeight = "50vh";
        clearLoginInputs();
    } else {
        document.querySelector('.login-child').style.minHeight = "45vh";
    }
}

// Event listeners for input fields in the login section
document.querySelectorAll('.input-fields input').forEach(inputElement => {
    inputElement.addEventListener('input', () => {
        clearErrors();
        checkLoginErrorMessage();
    });
});

// --------------------- Signup Section ---------------------

// Checks user details and validates input for signup.
function checkUserDetails() {
    const name = document.getElementById('signup-name').value;
    const number = document.getElementById('signup-number').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const inputElements = document.querySelector(".signup-heading");
    clearErrors();
    clearSignupInputs();

    // Check for empty fields
    if (name === "" || number === "" || email === "" || password === "") {
        showError(inputElements, "Please fill in all fields.");
        checkSignupErrorMessage();
        return;
    }

    // Validate email and number
    if (!validateNumber(number) && !validateEmail(email)) {
        const errorMessage = "Please Enter a Valid Email Or Number!";
        showError(inputElements, errorMessage);
        checkSignupErrorMessage();
        return;
    }

    // Validate mobile number
    if (!validateNumber(number)) {
        const errorMessage = "Please Enter a Valid Mobile Number!";
        showError(inputElements, errorMessage);
        checkSignupErrorMessage();
        return;
    }

    // Validate email
    if (!validateEmail(email)) {
        const errorMessage = "Please Enter a Valid Email Id!";
        showError(inputElements, errorMessage);
        checkSignupErrorMessage();
        return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError !== true) {
        showError(inputElements, passwordError);
        checkSignupErrorMessage();
        return;
    }

    // Register user if all validations pass
    registerUser(name, password, email, number);
}

// Clears input fields in the signup form.
function clearSignupInputs() {
    const signup_inputs = document.querySelectorAll(".signup-input-fields input");
    signup_inputs.forEach(input => {
        input.value = "";
    });
}

// Checks for signup error messages and adjusts the height of the signup section.
function checkSignupErrorMessage() {
    const errorMessage = document.querySelector('.errorMessage');
    if (errorMessage) {
        document.querySelector('.login-child').style.minHeight = "63vh";
        clearSignupInputs();
    } else {
        document.querySelector('.login-child').style.minHeight = "55vh";
    }
}

// Event listeners for input fields in the signup section
document.querySelectorAll('.signup-input-fields input').forEach(inputElement => {
    inputElement.addEventListener('input', () => {
        clearErrors();
        checkSignupErrorMessage();
    });
});

// --------------------- Register Section ---------------------

// Registers the user by sending a POST request to the server.
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
                pageHandle();
                alert(data.message);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Registration failed. Please try again later.');
        });
}

// --------------------- Validation Functions ---------------------

// Validates email format.
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validates mobile number format.
function validateNumber(number) {
    return number.length === 10; // Validates for a 10-digit number
}

// Validates password strength.
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

    return true; // Valid password
}

// --------------------- Error Handling Functions ---------------------

// Displays an error message.
function showError(mainElement, errorMessage) {
    const errordiv = document.createElement("div");
    errordiv.textContent = errorMessage;
    errordiv.classList.add("errorMessage");
    mainElement.append(errordiv);
}

// Clears all error messages from the form.
function clearErrors() {
    const existingErrors = document.querySelectorAll('.errorMessage');
    existingErrors.forEach(error => error.remove());
}

// --------------------- Visibility Check Function ---------------------

// Adjusts the minimum height of the login/signup section based on visibility.
function checkVisiblePage() {
    const loginParent = document.querySelector('.login-parent');
    const isSmallScreen = window.innerWidth === 320;
    const isMobileScreen = window.innerWidth === 480;
    const isTabletScreen = window.innerWidth === 768;

    if (isSmallScreen) {
        document.querySelector('.login-child').style.minHeight = loginParent.classList.contains('flipped') ? "60vh" : "50vh";
    } 
     else if (isMobileScreen) {
        document.querySelector('.login-child').style.minHeight = loginParent.classList.contains('flipped') ? "60vh" : "50vh";
    } 
     else if (isTabletScreen) {
        document.querySelector('.login-child').style.minHeight = loginParent.classList.contains('flipped') ? "65vh" : "50vh";
    } 
    else {
        document.querySelector('.login-child').style.minHeight = loginParent.classList.contains('flipped') ? "58vh" : "45vh";
    }
}


// --------------------- Database Management Functions ---------------------

// Clears the database when called.
function clearDatabase() {
    socket.emit('clear Database');
}

// Clears messages from the message database when called.
function clearMessage() {
    socket.emit('clear Message Database');
}
