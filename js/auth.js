// Auth.js - Temporary version without Firebase
// This is a placeholder that maintains UI functionality without Firebase dependencies

import { 
  loginWithEmailPassword, 
  createAccount, 
  loginWithGoogle, 
  getCurrentUser, 
  onAuthChange, 
  logoutUser 
} from './firebase.js';

// DOM Elements
const loginButton = document.getElementById('login-button');
const authModal = document.getElementById('auth-modal');
const authClose = document.getElementById('auth-close');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const googleButton = document.querySelectorAll('.google-login-button');
const authMessage = document.querySelectorAll('.auth-message');
const userDropdown = document.getElementById('user-dropdown');
const userAvatar = document.getElementById('user-avatar');
const userMenu = document.getElementById('user-menu');
const logoutButton = document.getElementById('logout-button');

// Initialize UI based on auth state
function initAuthUI() {
  onAuthChange((user) => {
    if (user) {
      // User is signed in
      if (loginButton) {
        loginButton.style.display = 'none';
      }
      if (userDropdown) {
        userDropdown.style.display = 'block';
        if (userAvatar) {
          userAvatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
        }
      }
      
      // Hide auth modal if it's open
      if (authModal && authModal.classList.contains('active')) {
        authModal.classList.remove('active');
      }
    } else {
      // User is signed out
      if (loginButton) {
        loginButton.style.display = 'inline-block';
      }
      if (userDropdown) {
        userDropdown.style.display = 'none';
      }
      
      // Redirect from dashboard to home if logged out
      if (window.location.pathname.includes('dashboard')) {
        window.location.href = 'index.html';
      }
    }
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Login button click
  if (loginButton) {
    loginButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (authModal) {
        authModal.classList.add('active');
      }
    });
  }
  
  // Close modal
  if (authClose) {
    authClose.addEventListener('click', () => {
      if (authModal) {
        authModal.classList.remove('active');
      }
    });
  }
  
  // Close modal when clicking outside
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        authModal.classList.remove('active');
      }
    });
  }
  
  // Tab switching
  if (loginTab && registerTab) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      if (loginForm) loginForm.classList.add('active');
      if (registerForm) registerForm.classList.remove('active');
      clearMessages();
    });
    
    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      if (registerForm) registerForm.classList.add('active');
      if (loginForm) loginForm.classList.remove('active');
      clearMessages();
    });
  }
  
  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Disable form submission during login attempt
      const submitButton = loginForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        const loginResult = await loginWithEmailPassword(email, password);
        
        if (loginResult.success) {
          showMessage(loginForm.querySelector('.auth-message'), 'Login successful! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        } else {
          showMessage(loginForm.querySelector('.auth-message'), loginResult.error, 'error');
        }
      } catch (error) {
        showMessage(loginForm.querySelector('.auth-message'), 'An unexpected error occurred.', 'error');
        console.error('Login error:', error);
      } finally {
        // Re-enable form submission
        if (submitButton) submitButton.disabled = false;
      }
    });
  }
  
  // Register form submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Disable form submission during registration attempt
      const submitButton = registerForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      if (password !== confirmPassword) {
        showMessage(registerForm.querySelector('.auth-message'), 'Passwords do not match', 'error');
        if (submitButton) submitButton.disabled = false;
        return;
      }
      
      try {
        const registerResult = await createAccount(email, password);
        
        if (registerResult.success) {
          showMessage(registerForm.querySelector('.auth-message'), 'Account created successfully! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        } else {
          showMessage(registerForm.querySelector('.auth-message'), registerResult.error, 'error');
        }
      } catch (error) {
        showMessage(registerForm.querySelector('.auth-message'), 'An unexpected error occurred.', 'error');
        console.error('Registration error:', error);
      } finally {
        // Re-enable form submission
        if (submitButton) submitButton.disabled = false;
      }
    });
  }
  
  // Google login buttons
  googleButton.forEach(button => {
    if (button) {
      button.addEventListener('click', async () => {
        // Disable button during login attempt
        button.disabled = true;
        
        try {
          const googleResult = await loginWithGoogle();
          
          if (googleResult.success) {
            const form = button.closest('.auth-form');
            if (form) {
              showMessage(form.querySelector('.auth-message'), 'Login successful! Redirecting...', 'success');
            }
            
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1000);
          } else {
            const form = button.closest('.auth-form');
            if (form) {
              showMessage(form.querySelector('.auth-message'), googleResult.error, 'error');
            }
          }
        } catch (error) {
          const form = button.closest('.auth-form');
          if (form) {
            showMessage(form.querySelector('.auth-message'), 'An unexpected error occurred.', 'error');
          }
          console.error('Google login error:', error);
        } finally {
          // Re-enable button
          button.disabled = false;
        }
      });
    }
  });
  
  // User dropdown toggle
  if (userAvatar) {
    userAvatar.addEventListener('click', () => {
      if (userMenu) {
        userMenu.classList.toggle('active');
      }
    });
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (userDropdown && !userDropdown.contains(e.target) && userMenu) {
      userMenu.classList.remove('active');
    }
  });
  
  // Logout button
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        const logoutResult = await logoutUser();
        
        if (logoutResult.success) {
          window.location.href = 'index.html';
        } else {
          alert(logoutResult.error || 'An error occurred during logout.');
        }
      } catch (error) {
        alert('An unexpected error occurred during logout.');
        console.error('Logout error:', error);
      }
    });
  }
}

// Helper function to show messages
function showMessage(element, message, type) {
  if (element) {
    element.textContent = message;
    element.className = 'auth-message';
    element.classList.add(`auth-${type}`);
    element.style.display = 'block';
  }
}

// Helper function to clear messages
function clearMessages() {
  authMessage.forEach(message => {
    message.textContent = '';
    message.className = 'auth-message';
    message.style.display = 'none';
  });
}

// Initialize auth UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
  setupEventListeners();
}); 