document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const togglePasswords = document.querySelectorAll('.toggle-password');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.tab === 'login') {
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
            }
        });
    });

    // Toggle Password Visibility
    togglePasswords.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                toggle.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                toggle.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Add keyboard accessibility to login form
    loginForm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginBtn.click();
        }
    });

    // Add keyboard accessibility to login button
    loginBtn.setAttribute('role', 'button');
    loginBtn.setAttribute('tabindex', '0');
    loginBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLogin();
        }
    });

    // Login Handler Function
    function handleLogin() {
        const email = loginEmail.value;
        const password = loginPassword.value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Get stored users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(user));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
            }
            showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification('Invalid email or password!', 'error');
        }
    }

    // Login Button Click Handler
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogin();
    });

    // Signup Handler
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        // Get stored users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            showNotification('Email already registered!', 'error');
            return;
        }

        // Add new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            dateJoined: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        showNotification('Registration successful! Please login.', 'success');
        setTimeout(() => {
            tabBtns[0].click(); // Switch to login tab
        }, 1500);
    });

    // Notification Handler
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 'var(--error-color)';
        document.body.appendChild(notification);
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
            notification.remove();
        }, 3000);
    }
}); 