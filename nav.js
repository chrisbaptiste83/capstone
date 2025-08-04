// nav.js// nav.js
function initializeNavigation() {
    // Get navigation elements
    const profileLink = document.getElementById('profile-link');
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const userEmailDisplay = document.getElementById('user-email-display');

    // Show loading state
    showNavLoading();

    // Auth state change listener
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is logged in
            if (profileLink) {
                profileLink.classList.remove('hidden');
                profileLink.href = 'profile.html';
            }
            if (loginLink) loginLink.classList.add('hidden');
            if (signupLink) {
                signupLink.textContent = 'Logout';
                signupLink.href = '#';
                signupLink.onclick = async (e) => {
                    e.preventDefault();
                    try {
                        await firebase.auth().signOut();
                        window.location.href = 'index.html';
                    } catch (error) {
                        console.error('Logout error:', error);
                        alert('Error logging out: ' + error.message);
                    }
                };
            }
            if (userEmailDisplay) {
                userEmailDisplay.textContent = user.email;
                userEmailDisplay.classList.remove('hidden');
            }
        } else {
            // User is logged out
            if (profileLink) profileLink.classList.add('hidden');
            if (loginLink) {
                loginLink.classList.remove('hidden');
                loginLink.href = 'login.html';
            }
            if (signupLink) {
                signupLink.textContent = 'Sign Up';
                signupLink.href = 'signup.html';
                signupLink.onclick = null;
            }
            if (userEmailDisplay) {
                userEmailDisplay.classList.add('hidden');
            }
        }
        // Hide loading state
        hideNavLoading();
    });
}

function showNavLoading() {
    const nav = document.querySelector('nav');
    if (nav) nav.classList.add('nav-loading');
}

function hideNavLoading() {
    const nav = document.querySelector('nav');
    if (nav) nav.classList.remove('nav-loading');
}

// Set active navigation item
function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('nav-active');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    setActiveNavItem();
});
