
function pageHandle() {
    const loginPresent = document.querySelector('.login-parent');
    loginPresent.classList.toggle('flipped');
}

function authenticateUser() {
    const loginEmail = document.getElementById("login-username").value;
    const loginPassword = document.getElementById("login-password").value;

};
