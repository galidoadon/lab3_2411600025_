
document.addEventListener('DOMContentLoaded', function() {

    var loginBtn = document.getElementById('loginBtn');
    var loginForm = document.getElementById('loginForm');
    var usernameInput = document.getElementById('username');
    var passwordInput = document.getElementById('password');
    var feedbackDiv = document.getElementById('loginFeedback');

    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
        return;
    }

    function handleLogin(event) {
        if (event) {
            event.preventDefault();
        }

        var username = (usernameInput.value || '').trim();
        var password = (passwordInput.value || '').trim();

        if (username === '' || password === '') {
            feedbackDiv.innerHTML = '<div class="alert alert-danger">Please enter both username and password.</div>';
            return;
        }

        if (username === 'adonis' && password === 'password123') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', 'Adonis Eugenio');

            feedbackDiv.innerHTML = '<div class="alert alert-success">Login successful! Opening system...</div>';

            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            feedbackDiv.innerHTML = '<div class="alert alert-danger">Invalid username or password.</div>';
        }
    }

    loginBtn.addEventListener('click', handleLogin);
    loginForm.addEventListener('submit', handleLogin);
});