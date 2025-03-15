// Authentication check for protected pages
function checkAuth() {
    // Check if user is logged in (either in localStorage or sessionStorage)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    
    // If no user is logged in, redirect to login page
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Check authentication status when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Add logout functionality
    const logoutBtn = document.createElement('button');
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    logoutBtn.className = 'logout-btn tool-btn';
    logoutBtn.title = 'Logout';
    
    // Add logout button to the toolbar
    const tools = document.querySelector('.tools');
    if (tools) {
        tools.appendChild(logoutBtn);
    }

    // Handle logout
    logoutBtn.addEventListener('click', () => {
        // Clear user data from both storages
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        
        // Redirect to login page
        window.location.href = 'login.html';
    });
}); 