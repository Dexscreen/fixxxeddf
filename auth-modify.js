// Integrated Authentication Handler
// This script integrates Firebase auth with the existing form structure

(function() {
    'use strict';
    
    // Wait for Firebase to be loaded
    function waitForFirebase(callback) {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            callback();
        } else {
            setTimeout(function() { waitForFirebase(callback); }, 100);
        }
    }
    
    // Initialize authentication handlers
    function initAuth() {
        var auth = firebase.auth();
        
        // ============================================
        // REMOVE LOADING STATE FROM BUTTONS
        // ============================================
        function removeLoadingState(buttonId, originalText) {
            var button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('loading');
                button.disabled = false;
                button.textContent = originalText;
                button.style.minWidth = '';
            }
        }
        
        // Remove loading states immediately
        removeLoadingState('auth_signin', 'Sign in');
        removeLoadingState('auth_signup', 'Sign up');
        removeLoadingState('auth_reset_btn', 'Send reset link');
        
        // ============================================
        // FORM HELPERS
        // ============================================
        function getFormValue(formId, inputName) {
            var form = document.getElementById(formId);
            if (!form) return '';
            var input = form.querySelector('input[name="' + inputName + '"]');
            return input ? input.value.trim() : '';
        }
        
        function showError(errorId) {
            var errorDiv = document.getElementById(errorId);
            if (errorDiv) {
                errorDiv.style.display = 'block';
            }
        }
        
        function hideError(errorId) {
            var errorDiv = document.getElementById(errorId);
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }
        
        function hideAllErrors() {
            var errors = document.querySelectorAll('.auth-error');
            errors.forEach(function(error) {
                error.style.display = 'none';
            });
        }
        
        function setButtonLoading(buttonId, isLoading) {
            var button = document.getElementById(buttonId);
            if (!button) return;
            
            if (isLoading) {
                button.classList.add('loading');
                button.disabled = true;
                button.textContent = 'Loading';
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
        
        function clearFormInputs(formId) {
            var form = document.getElementById(formId);
            if (!form) return;
            var inputs = form.querySelectorAll('input[type="text"], input[type="password"]');
            inputs.forEach(function(input) {
                input.value = '';
            });
        }
        
        function closeAuthPopup() {
            var popup = document.querySelector('.popup-auth');
            if (popup && popup.parentElement) {
                popup.parentElement.style.display = 'none';
            }
        }
        
        // ============================================
        // SIGN IN HANDLER
        // ============================================
        function handleSignIn(e) {
            if (e) e.preventDefault();
            
            hideAllErrors();
            
            var email = getFormValue('layout_signin', 'email');
            var password = getFormValue('layout_signin', 'pswd');
            
            if (!email || !password) {
                showError('auth_error');
                return false;
            }
            
            setButtonLoading('auth_signin', true);
            
            auth.signInWithEmailAndPassword(email, password)
                .then(function(userCredential) {
                    console.log('User signed in:', userCredential.user);
                    setButtonLoading('auth_signin', false);
                    clearFormInputs('layout_signin');
                    closeAuthPopup();
                    
                    // Update UI
                    if (typeof updateUIForLoggedInUser === 'function') {
                        updateUIForLoggedInUser(userCredential.user);
                    }
                })
                .catch(function(error) {
                    console.error('Sign in error:', error);
                    setButtonLoading('auth_signin', false);
                    showError('auth_error');
                });
            
            return false;
        }
        
        // ============================================
        // SIGN UP HANDLER
        // ============================================
        function handleSignUp(e) {
            if (e) e.preventDefault();
            
            hideAllErrors();
            
            var email = getFormValue('layout_signup', 'email');
            var password = getFormValue('layout_signup', 'pswd');
            var confirmPassword = getFormValue('layout_signup', 'repswd');
            
            if (!email || !password || !confirmPassword) {
                showError('auth_signup_error');
                return false;
            }
            
            if (password !== confirmPassword) {
                showError('auth_signup_error');
                return false;
            }
            
            // Password validation
            var hasUpperCase = /[A-Z]/.test(password);
            var hasLowerCase = /[a-z]/.test(password);
            var hasNumber = /[0-9]/.test(password);
            var isLongEnough = password.length >= 6;
            
            if (!hasUpperCase || !hasLowerCase || !hasNumber || !isLongEnough) {
                showError('auth_signup_error');
                return false;
            }
            
            setButtonLoading('auth_signup', true);
            
            auth.createUserWithEmailAndPassword(email, password)
                .then(function(userCredential) {
                    console.log('User signed up:', userCredential.user);
                    setButtonLoading('auth_signup', false);
                    clearFormInputs('layout_signup');
                    closeAuthPopup();
                    
                    // Update UI
                    if (typeof updateUIForLoggedInUser === 'function') {
                        updateUIForLoggedInUser(userCredential.user);
                    }
                })
                .catch(function(error) {
                    console.error('Sign up error:', error);
                    setButtonLoading('auth_signup', false);
                    showError('auth_signup_error');
                });
            
            return false;
        }
        
        // ============================================
        // PASSWORD RESET HANDLER
        // ============================================
        function handlePasswordReset(e) {
            if (e) e.preventDefault();
            
            hideAllErrors();
            
            var email = getFormValue('layout_forgot', 'email');
            
            if (!email) {
                showError('auth_reset_error');
                return false;
            }
            
            setButtonLoading('auth_reset_btn', true);
            
            auth.sendPasswordResetEmail(email)
                .then(function() {
                    console.log('Password reset email sent');
                    setButtonLoading('auth_reset_btn', false);
                    
                    // Show success message
                    var successDiv = document.getElementById('auth_reset_success');
                    if (successDiv) {
                        successDiv.style.display = 'block';
                    }
                    
                    // Hide the reset button
                    var resetBtn = document.getElementById('auth_reset_btn');
                    if (resetBtn && resetBtn.parentElement) {
                        resetBtn.parentElement.style.display = 'none';
                    }
                })
                .catch(function(error) {
                    console.error('Password reset error:', error);
                    setButtonLoading('auth_reset_btn', false);
                    showError('auth_reset_error');
                });
            
            return false;
        }
        
        // ============================================
        // ATTACH EVENT LISTENERS
        // ============================================
        
        // Sign in button
        var signInBtn = document.getElementById('auth_signin');
        if (signInBtn) {
            signInBtn.onclick = handleSignIn;
            
            // Also handle form submit
            var signInForm = document.getElementById('layout_signin');
            if (signInForm) {
                signInForm.onsubmit = handleSignIn;
            }
        }
        
        // Sign up button
        var signUpBtn = document.getElementById('auth_signup');
        if (signUpBtn) {
            signUpBtn.onclick = handleSignUp;
            
            // Also handle form submit
            var signUpForm = document.getElementById('layout_signup');
            if (signUpForm) {
                signUpForm.onsubmit = handleSignUp;
            }
        }
        
        // Password reset button
        var resetBtn = document.getElementById('auth_reset_btn');
        if (resetBtn) {
            resetBtn.onclick = handlePasswordReset;
            
            // Also handle form submit
            var forgotForm = document.getElementById('layout_forgot');
            if (forgotForm) {
                forgotForm.onsubmit = handlePasswordReset;
            }
        }
        
        // Handle Enter key in inputs
        var allInputs = document.querySelectorAll('.auth-layout input');
        allInputs.forEach(function(input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    var form = input.closest('.auth-layout');
                    if (form) {
                        if (form.id === 'layout_signin') {
                            handleSignIn(e);
                        } else if (form.id === 'layout_signup') {
                            handleSignUp(e);
                        } else if (form.id === 'layout_forgot') {
                            handlePasswordReset(e);
                        }
                    }
                }
            });
        });
        
        console.log('Auth integration initialized');
    }
    
    // ============================================
    // CONTINUOUS MONITORING
    // ============================================
    function setupContinuousMonitoring() {
        // Monitor buttons and remove loading state if it reappears
        setInterval(function() {
            var signInBtn = document.getElementById('auth_signin');
            var signUpBtn = document.getElementById('auth_signup');
            var resetBtn = document.getElementById('auth_reset_btn');
            
            if (signInBtn && signInBtn.classList.contains('loading') && !signInBtn.dataset.intentionalLoading) {
                signInBtn.classList.remove('loading');
                signInBtn.disabled = false;
                if (signInBtn.textContent === 'Loading') {
                    signInBtn.textContent = 'Sign in';
                }
            }
            
            if (signUpBtn && signUpBtn.classList.contains('loading') && !signUpBtn.dataset.intentionalLoading) {
                signUpBtn.classList.remove('loading');
                signUpBtn.disabled = false;
                if (signUpBtn.textContent === 'Loading') {
                    signUpBtn.textContent = 'Sign up';
                }
            }
            
            if (resetBtn && resetBtn.classList.contains('loading') && !resetBtn.dataset.intentionalLoading) {
                resetBtn.classList.remove('loading');
                resetBtn.disabled = false;
                if (resetBtn.textContent === 'Loading') {
                    resetBtn.textContent = 'Send reset link';
                }
            }
        }, 100);
    }
    
    // ============================================
    // INITIALIZE
    // ============================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // waitForFirebase(initAuth);
            setupContinuousMonitoring();
        });
    } else {
        // waitForFirebase(initAuth);
        setupContinuousMonitoring();
    }
    
    // Also initialize after delays to catch late-loaded elements
    setTimeout(function() {
        // waitForFirebase(initAuth);
        setupContinuousMonitoring();
    }, 1000);
    
})();
