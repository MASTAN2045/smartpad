document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileBio = document.getElementById('profileBio');
    const joinDate = document.getElementById('joinDate');
    const totalNotes = document.getElementById('totalNotes');
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const passwordModal = document.getElementById('passwordModal');
    const backToEditor = document.getElementById('backToEditor');
    const themeToggle = document.getElementById('themeToggle');

    // Load user data
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize profile data
    function initializeProfile() {
        profileName.value = currentUser.name || '';
        profileEmail.value = currentUser.email || '';
        profileBio.value = currentUser.bio || '';
        joinDate.textContent = new Date(currentUser.dateJoined).toLocaleDateString();
        
        // Count total notes
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const userNotes = notes.filter(note => note.userId === currentUser.id);
        totalNotes.textContent = userNotes.length;

        // Load theme preference
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Update profile
    updateProfileBtn.addEventListener('click', () => {
        const updatedUser = {
            ...currentUser,
            name: profileName.value,
            bio: profileBio.value,
        };

        // Update user in storage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update current user in session
            if (localStorage.getItem('currentUser')) {
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }

            showNotification('Profile updated successfully!', 'success');
        }
    });

    // Password change functionality
    changePasswordBtn.addEventListener('click', () => {
        passwordModal.style.display = 'flex';
    });

    document.querySelector('.close-modal').addEventListener('click', () => {
        passwordModal.style.display = 'none';
    });

    document.getElementById('cancelPasswordChange').addEventListener('click', () => {
        passwordModal.style.display = 'none';
    });

    document.getElementById('savePasswordChange').addEventListener('click', () => {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (currentPassword !== currentUser.password) {
            showNotification('Current password is incorrect!', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match!', 'error');
            return;
        }

        // Update password
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update current user
            currentUser.password = newPassword;
            if (localStorage.getItem('currentUser')) {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            }

            showNotification('Password updated successfully!', 'success');
            passwordModal.style.display = 'none';
        }
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const input = e.target.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            e.target.classList.toggle('fa-eye');
            e.target.classList.toggle('fa-eye-slash');
        });
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Back to editor
    backToEditor.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Notification function
    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.backgroundColor = type === 'success' ? 'var(--primary-color)' : '#f44336';
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Initialize profile
    initializeProfile();
}); 