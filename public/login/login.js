// Login form validation and Firebase authentication
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const loginForm = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('.btn');
    const statusContainer = document.getElementById('statusContainer');

    // Initialize Firebase if not already initialized
    try {
        if (!firebase.apps.length) {
            // Firebase configuration from app.js
            const firebaseConfig = {
                apiKey: "AIzaSyC1xpIBYJ9z8Xgwrt1RkZQffyPhtnAhY3c",
                authDomain: "blocksmiths-a8021.firebaseapp.com",
                databaseURL: "https://blocksmiths-a8021-default-rtdb.asia-southeast1.firebasedatabase.app",
                projectId: "blocksmiths-a8021",
                storageBucket: "blocksmiths-a8021.firebasestorage.app",
                messagingSenderId: "243684466522",
                appId: "1:243684466522:web:8f1231b1e3831de1c99d63",
                measurementId: "G-FVBSQRWGB1"
            };
            
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized for authentication");
        }
    } catch (error) {
        console.error("Firebase initialization error:", error);
        showMessage('Failed to initialize Firebase: ' + error.message, 'error', loginButton, loginForm);
    }

    // Check if user is already logged in
    checkExistingLogin();

    // Form submission handler
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Basic validation
        if (validateForm()) {
            // Normalize email before attempting login
            const normalizedEmail = normalizeEmail(emailInput.value);
            
            // Update the input field with normalized email to ensure consistency
            emailInput.value = normalizedEmail;
            
            // Authenticate with Firebase
            attemptLogin(normalizedEmail, passwordInput.value);
        }
    });

    // Normalize email function
    function normalizeEmail(email) {
        // Trim whitespace and convert to lowercase
        return email.trim().toLowerCase();
    }

    // Form validation function
    function validateForm() {
        let isValid = true;
        
        // Email validation
        if (!emailInput.value || !isValidEmail(emailInput.value)) {
            showMessage('Please enter a valid email address', 'error', loginButton, loginForm);
            emailInput.focus();
            isValid = false;
        }
        
        // Password validation
        else if (!passwordInput.value || passwordInput.value.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error', loginButton, loginForm);
            passwordInput.focus();
            isValid = false;
        }
        
        return isValid;
    }

    // Email format validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Login function using Firebase Authentication
    function attemptLogin(email, password) {
        // Show loading state
        loginButton.textContent = 'Authenticating...';
        loginButton.disabled = true;
        
        // Check for internet connection
        if (!navigator.onLine) {
            showMessage('No internet connection. Please check your network and try again.', 'error', loginButton, loginForm);
            loginButton.textContent = 'LOGIN';
            loginButton.disabled = false;
            return;
        }
        
        // Log the normalized email being used
        console.log("Attempting login with normalized email:", email);
        
        // Check if email exists in database before attempting auth
        preCheckEmailBeforeAuth(email)
            .then(emailExists => {
                if (!emailExists) {
                    showMessage('No account found with this email. Please sign up first.', 'error', loginButton, loginForm);
                    loginButton.textContent = 'LOGIN';
                    loginButton.disabled = false;
                    return Promise.reject({ code: 'auth/user-not-found', handled: true });
                }
                
                // Proceed with authentication
                return firebase.auth().signInWithEmailAndPassword(email, password);
            })
            .then((userCredential) => {
                // Get the authenticated user
                const user = userCredential.user;
                
                // Fetch additional user data from Firebase Realtime Database
                return firebase.database().ref('users/' + user.uid).once('value')
                    .then((snapshot) => {
                        // Store user info in localStorage
                        const userData = snapshot.val() || {};
                        
                        // If the user record doesn't exist in the database, create it
                        if (!snapshot.exists()) {
                            const newUserData = {
                                name: user.displayName || '',
                                email: user.email.toLowerCase().trim(),
                                role: 'user',
                                createdAt: firebase.database.ServerValue.TIMESTAMP,
                                lastLogin: firebase.database.ServerValue.TIMESTAMP,
                                authMethod: 'email_password',
                                uid: user.uid
                            };
                            
                            console.log("Creating missing user record in database:", newUserData);
                            
                            // Create the user record
                            return firebase.database().ref('users/' + user.uid).set(newUserData)
                                .then(() => newUserData);
                        }
                        
                        return userData;
                    })
                    .then(userData => {
                        // Store user info in localStorage
                        localStorage.setItem('userLoggedIn', 'true');
                        localStorage.setItem('userUid', user.uid);
                        localStorage.setItem('userName', user.displayName || userData.name || '');
                        localStorage.setItem('userEmail', user.email);
                        localStorage.setItem('userRole', userData.role || 'user');
                        
                        // Update last login time in the database
                        return firebase.database().ref('users/' + user.uid).update({
                            lastLogin: firebase.database.ServerValue.TIMESTAMP,
                            loginMethod: 'email_password'
                        }).then(() => userData);
                    });
            })
            .then((userData) => {
                // Check if admin login
                if (userData.role === 'admin') {
                    showMessage('Admin login successful! Redirecting...', 'success', loginButton, loginForm);
                    setTimeout(() => {
                        window.location.href = '../admin/superuser.html';
                    }, 1000);
                } else {
                    // Regular user login
                    showMessage('Login successful! Redirecting...', 'success', loginButton, loginForm);
                    setTimeout(() => {
                        window.location.href = '../home.html';
                    }, 1000);
                }
            })
            .catch((error) => {
                // Skip if already handled
                if (error.handled) return;
                
                console.error('Login error:', error);
                
                // Handle specific Firebase errors
                switch (error.code) {
                    case 'auth/user-not-found':
                        // Before showing error, check database directly to see if user exists
                        // This helps detect if there's a database record but no auth record
                        checkEmailInDatabase(email);
                        break;
                    case 'auth/wrong-password':
                        showMessage('Incorrect password', 'error', loginButton, loginForm);
                        break;
                    case 'auth/invalid-email':
                        showMessage('Invalid email format', 'error', loginButton, loginForm);
                        break;
                    case 'auth/user-disabled':
                        showMessage('This account has been disabled', 'error', loginButton, loginForm);
                        break;
                    case 'auth/too-many-requests':
                        showMessage('Too many failed login attempts. Please try again later', 'error', loginButton, loginForm);
                        break;
                    case 'auth/network-request-failed':
                        showMessage('Network error. Please check your internet connection.', 'error', loginButton, loginForm);
                        break;
                    default:
                        showMessage('Login failed: ' + error.message, 'error', loginButton, loginForm);
                }
                
                // Reset button state
                loginButton.textContent = 'LOGIN';
                loginButton.disabled = false;
            });
    }
    
    // Pre-check email in both Auth and Database before attempting login
    function preCheckEmailBeforeAuth(email) {
        return Promise.all([
            // Check Firebase Auth
            firebase.auth().fetchSignInMethodsForEmail(email)
                .then(methods => methods && methods.length > 0)
                .catch(() => false),
                
            // Check Database
            firebase.database().ref('users').orderByChild('email').equalTo(email).once('value')
                .then(snapshot => snapshot.exists())
                .catch(() => false)
        ])
        .then(([existsInAuth, existsInDb]) => {
            return existsInAuth || existsInDb;
        })
        .catch(() => {
            // In case of any error, proceed with normal login flow
            return true;
        });
    }

    // Function to check if email exists in database but not in auth
    function checkEmailInDatabase(email) {
        // Look through all users in the database to find matching email
        firebase.database().ref('users').orderByChild('email').equalTo(email).once('value')
            .then((snapshot) => {
                if (snapshot.exists()) {
                    // Email exists in database but not in auth - this means auth record might be missing
                    showMessage('Account found in database but not in authentication system. Creating auth record...', 'info', loginButton, loginForm);
                    
                    // Attempt to reconcile by sending password reset email
                    firebase.auth().sendPasswordResetEmail(email)
                        .then(() => {
                            showMessage('We\'ve sent a password reset link to your email. Please check your inbox to reset your password and try again.', 'success', loginButton, loginForm);
                        })
                        .catch((error) => {
                            console.error("Error sending password reset:", error);
                            showMessage('This email exists in our database but not in the authentication system. Please contact support or try signing up again with a different email.', 'error', loginButton, loginForm);
                        });
                } else {
                    // Email doesn't exist in either system
                    showMessage('No account found with this email. Please sign up first.', 'error', loginButton, loginForm);
                }
            })
            .catch((error) => {
                console.error("Error checking database:", error);
                showMessage('Error checking user records. Please try again.', 'error', loginButton, loginForm);
            });
    }

    // Function to show message (success or error)
    function showMessage(message, type, loginButton, loginForm) {
        // Get the status container
        const statusContainer = document.getElementById('statusContainer');
        if (!statusContainer) {
            console.error('Status container not found');
            return;
        }

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `status-message ${type}`;
        messageElement.textContent = message;

        // Add to container
        statusContainer.appendChild(messageElement);

        // Remove after 5 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                statusContainer.removeChild(messageElement);
            }, 300);
        }, 5000);
    }

    // Check if user is already logged in
    function checkExistingLogin() {
        // We want to prevent the auto-redirect on the login page
        // Instead, just check if we have a valid user and update the local storage
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log("User is signed in but will not be auto-redirected: " + user.email);
                
                // Update localStorage with user info but don't redirect
                firebase.database().ref('users/' + user.uid).once('value')
                    .then((snapshot) => {
                        const userData = snapshot.val() || {};
                        
                        // If the user is in Auth but not in Database, create the record
                        if (!snapshot.exists()) {
                            const newUserData = {
                                name: user.displayName || '',
                                email: user.email.toLowerCase().trim(),
                                role: 'user',
                                createdAt: firebase.database.ServerValue.TIMESTAMP,
                                lastLogin: firebase.database.ServerValue.TIMESTAMP,
                                authMethod: 'email_password',
                                uid: user.uid
                            };
                            
                            console.log("Creating missing user record in database:", newUserData);
                            
                            // Create the user record
                            return firebase.database().ref('users/' + user.uid).set(newUserData)
                                .then(() => {
                                    return { role: 'user' };
                                });
                        }
                        
                        return userData;
                    })
                    .catch(error => {
                        console.error("Error fetching user data:", error);
                    });
            } else {
                // No authenticated user in Firebase
                console.log("No authenticated user found in Firebase");
                
                // Clear any previous login data from localStorage
                if (localStorage.getItem('userLoggedIn') === 'true') {
                    console.log("Clearing outdated localStorage login data");
                    localStorage.removeItem('userLoggedIn');
                    localStorage.removeItem('userUid');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('user');
                    // Stay on login page - don't redirect
                }
            }
        });
    }
    
    // Add a password visibility toggle
    const togglePassword = document.createElement('span');
    
    togglePassword.style.position = 'absolute';
    togglePassword.style.right = '20px';
    togglePassword.style.top = '50%';
    togglePassword.style.transform = 'translateY(-50%)';
    togglePassword.style.cursor = 'pointer';
    togglePassword.style.color = '#9ca3af';
    
    // Position the toggle button
    const passwordGroup = passwordInput.parentElement;
    passwordGroup.style.position = 'relative';
    passwordGroup.appendChild(togglePassword);
    
    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
    });

    // CSS Loading diagnostics
    console.log("DOM Content Loaded for login page");
    
    // Log any CSS loading issues
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    styles.forEach(styleSheet => {
        console.log(`CSS Load Status: ${styleSheet.href} - ${styleSheet.sheet ? 'Loaded' : 'Not Loaded'}`);
        
        // Check for CORS issues
        if (!styleSheet.sheet && styleSheet.href && !styleSheet.href.startsWith('data:')) {
            console.error(`Possible CORS issue or file not found: ${styleSheet.href}`);
        }
    });
    
    // Debug helper - add to debug object if opened
    function updateDebugWithCssInfo() {
        const debugElement = document.getElementById('debug');
        if (!debugElement || debugElement.style.display === 'none') return;
        
        let cssInfo = "\n=== CSS LOADING INFO ===\n";
        const styles = document.querySelectorAll('link[rel="stylesheet"]');
        
        styles.forEach(styleSheet => {
            cssInfo += `${styleSheet.href || 'inline style'}: ${styleSheet.sheet ? 'LOADED' : 'FAILED'}\n`;
        });
        
        // Check computed styles
        const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;
        cssInfo += `\nComputed body background: ${bodyBgColor}\n`;
        cssInfo += `Inline styles active: ${document.body.classList.contains('test-active') ? 'YES' : 'NO'}\n`;
        
        debugElement.textContent += cssInfo;
    }
    
    // Add to any existing debug update function
    const originalUpdateDebugInfo = window.updateDebugInfo || function(){};
    window.updateDebugInfo = function() {
        originalUpdateDebugInfo();
        updateDebugWithCssInfo();
    };

    function clearAllData() {
        // Clear Firebase auth state
        firebase.auth().signOut().then(() => {
            console.log("Signed out successfully");
        }).catch(error => {
            console.error("Error signing out:", error);
        });

        // Clear all localStorage data
        localStorage.clear();
        console.log("Local storage cleared");

        // Clear sessionStorage
        sessionStorage.clear();
        console.log("Session storage cleared");

        // Clear form fields
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';

        // Clear any status messages
        const statusContainer = document.getElementById('statusContainer');
        if (statusContainer) {
            statusContainer.innerHTML = '';
        }

        // Show success message
        showMessage('All data has been cleared successfully', 'success', null, null);

        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
});
