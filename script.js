// ========================================
// CYBER LEARNING HUB 
// ========================================




const ENCRYPTED_WORKER_HASH = '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b';
const DECRYPTION_KEY = 'cyber_hub_secret_key_2026';

function decryptWorkerURL() {
    const workerBase = 'https://cyber-hub.dhimanparas605.workers.dev';
    return workerBase; 
}

const API_BASE = decryptWorkerURL();
let authToken = localStorage.getItem('authToken');
let currentUser = null;



document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    initializePage();
});

function initializePage() {
    setupNavigation();
    setupCourseCards();
}

window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 1500);
});


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-times');
            icon.classList.toggle('fa-bars');
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('show');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// Scroll to top button
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Animated counter for stats
function animateCounter(elementId, target, duration = 2000) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 16);
}

// Initialize counters when section is in view
const observerOptions = {
    threshold: 0.5
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter('studentCount', 10000, 2000);
            animateCounter('courseCount', 15, 1500);
            animateCounter('toolCount', 8, 1200);
            animateCounter('certCount', 5000, 2500);
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Password strength checker for registration form
const registerPasswordInput = document.getElementById('registerPassword');
if (registerPasswordInput) {
    registerPasswordInput.addEventListener('input', function() {
        const password = this.value;
        const strengthIndicator = document.getElementById('registerPasswordStrength');
        if (!strengthIndicator) return;

        let score = 0;
        const feedback = [];

        if (password.length >= 8) score += 25;
        else feedback.push('Add more characters');

        if (/[A-Z]/.test(password)) score += 25;
        else feedback.push('Add uppercase letters');

        if (/[a-z]/.test(password)) score += 25;
        else feedback.push('Add lowercase letters');

        if (/\d/.test(password)) score += 12.5;
        else feedback.push('Add numbers');

        if (/[^A-Za-z0-9]/.test(password)) score += 12.5;
        else feedback.push('Add special characters');

        let strength = 'Weak';
        let color = '#ef4444';
        
        if (score >= 80) {
            strength = 'Strong';
            color = '#10b981';
        } else if (score >= 60) {
            strength = 'Good';
            color = '#f59e0b';
        } else if (score >= 40) {
            strength = 'Moderate';
            color = '#fbbf24';
        }

        let feedbackHTML = '';
        if (feedback.length > 0 && password.length > 0) {
            feedbackHTML = `<ul style="margin-top: 8px; font-size: 0.85em; color: #64748b;">${feedback.map(f => `<li>${f}</li>`).join('')}</ul>`;
        }

        strengthIndicator.innerHTML = `
            <div style="margin-top: 10px;">
                <div style="background: ${color}; height: 4px; width: 100%; border-radius: 2px; margin-bottom: 5px;">
                    <div style="background: white; height: 4px; width: ${100 - score}%; border-radius: 2px;"></div>
                </div>
                <p style="margin: 5px 0; font-size: 0.85em; color: ${color}; font-weight: 600;">
                    ${strength} (${Math.round(score)}%)
                </p>
                ${feedbackHTML}
            </div>
        `;
    });
}

// Form validation
const registerForm = document.querySelector('#registerModal form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        if (password !== confirmPassword) {
            e.preventDefault();
            showError('Passwords do not match!');
            return false;
        }

        if (password && password.length < 8) {
            e.preventDefault();
            showError('Password must be at least 8 characters long!');
            return false;
        }
    });
}

// Cookie consent
function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookieBanner')?.remove();
}

function declineCookies() {
    localStorage.setItem('cookiesAccepted', 'false');
    document.getElementById('cookieBanner')?.remove();
}

function customizeCookies() {
    alert('Cookie customization coming soon!');
}

// Show cookie banner if not accepted
window.addEventListener('load', () => {
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner && localStorage.getItem('cookiesAccepted') === null) {
        setTimeout(() => {
            cookieBanner.style.display = 'block';
        }, 2000);
    }
});

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        showSuccess('Thank you for subscribing! You\'ll receive updates soon.');
        this.reset();
    });
}

// Add active class to current navigation link
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
            const id = section.getAttribute('id');
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    checkAuthStatus();

    // Setup event listeners
    setupEventListeners();

    // Initialize page
    initializePage();

    // Setup navigation
    setupNavigation();
});

// Enhanced error/success messages with icons
function showError(message) {
    const div = document.createElement('div');
    div.className = 'toast toast-error';
    div.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

function showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'toast toast-success';
    div.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

function showInfo(message) {
    const div = document.createElement('div');
    div.className = 'toast toast-info';
    div.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

// Add toast styles to document head
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease, fadeOut 0.5s ease 4.5s;
        z-index: 10000;
        font-weight: 500;
    }

    .toast i {
        font-size: 1.2em;
    }

    .toast button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1em;
        margin-left: 15px;
    }

    .toast-error {
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .toast-success {
        background: linear-gradient(135deg, #10b981, #0da271);
    }

    .toast-info {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(toastStyles);

// Tool result animations
function showToolResult(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
        element.style.display = 'block';
        element.classList.add('show');
    }
}

// CTA Register button
const ctaRegisterBtn = document.getElementById('ctaRegisterBtn');
if (ctaRegisterBtn) {
    ctaRegisterBtn.addEventListener('click', () => {
        showModal('registerModal');
    });
}

// Remember me functionality
const rememberMeCheckbox = document.getElementById('rememberMe');
if (rememberMeCheckbox) {
    // Load saved credentials if available
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');
    
    if (savedUsername && savedPassword) {
        document.getElementById('loginUsername').value = savedUsername;
        document.getElementById('loginPassword').value = savedPassword;
        rememberMeCheckbox.checked = true;
    }

    rememberMeCheckbox.addEventListener('change', function() {
        if (!this.checked) {
            localStorage.removeItem('savedUsername');
            localStorage.removeItem('savedPassword');
        }
    });
}

// Enhanced login function with remember me
async function login() {
    const username = document.getElementById('loginUsername')?.value;
    const password = document.getElementById('loginPassword')?.value;
    const rememberMe = document.getElementById('rememberMe')?.checked;

    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            
            // Save credentials if remember me is checked
            if (rememberMe) {
                localStorage.setItem('savedUsername', username);
                localStorage.setItem('savedPassword', password);
            } else {
                localStorage.removeItem('savedUsername');
                localStorage.removeItem('savedPassword');
            }

            closeModal('loginModal');
            updateAuthUI(true);
            showSuccess('Login successful!');
            loadUserProgress();
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        showError('Login failed. Please try again.');
        console.error('Login error:', error);
    }
}

console.log('Cyber Learning Hub initialized successfully! 🚀');

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

function checkAuthStatus() {
    if (authToken) {
        verifyToken();
    } else {
        updateAuthUI(false);
    }
}

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE}/api/progress`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.progress) {
                updateAuthUI(true);
                loadProgress(data.progress);
            }
        } else {
            logout();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        logout();
    }
}

async function login() {
    const username = document.getElementById('loginUsername')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            closeModal('loginModal');
            updateAuthUI(true);
            showSuccess('Login successful!');
            
            // Reload progress
            loadUserProgress();
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        showError('Login failed. Please try again.');
        console.error('Login error:', error);
    }
}

async function register() {
    const username = document.getElementById('registerUsername')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;

    if (!username || !email || !password) {
        showError('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Registration successful! Please login.');
            closeModal('registerModal');
        } else {
            showError(data.error || 'Registration failed');
        }
    } catch (error) {
        showError('Registration failed. Please try again.');
        console.error('Registration error:', error);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    updateAuthUI(false);
    showSuccess('Logged out successfully');
}

function updateAuthUI(isLoggedIn) {
    const userMenu = document.getElementById('userMenu');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userName = document.getElementById('userName');
    const userDashboard = document.getElementById('userDashboard');

    if (isLoggedIn && userMenu && currentUser) {
        if (userMenu) userMenu.style.display = 'flex';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userName) userName.textContent = currentUser.username;
        if (userDashboard) userDashboard.style.display = 'block';
    } else {
        if (userMenu) userMenu.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (userDashboard) userDashboard.style.display = 'none';
    }
}

// ========================================
// PROGRESS TRACKING
// ========================================

async function loadUserProgress() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_BASE}/api/progress`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            loadProgress(data.progress);
        }
    } catch (error) {
        console.error('Failed to load progress:', error);
    }
}

async function loadProgress(progress) {
    const contentDiv = document.getElementById('progressContent');
    if (!contentDiv) return;

    if (Object.keys(progress).length === 0) {
        contentDiv.innerHTML = '<p style="text-align: center; color: var(--gray);">No progress yet. Start learning!</p>';
        return;
    }

    let html = '<div style="display: grid; gap: 20px;">';
    
    for (const [course, modules] of Object.entries(progress)) {
        const completedCount = Object.values(modules).filter(v => v).length;
        const totalCount = Object.keys(modules).length;
        const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        
        html += `
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid var(--primary);">
                <h4 style="color: var(--primary); margin-bottom: 10px;">${formatCourseName(course)}</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9em;">
                    <span>Progress: ${completedCount}/${totalCount} modules</span>
                    <span>${Math.round(percentage)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    contentDiv.innerHTML = html;
}

async function updateProgress(course, module) {
    if (!authToken) {
        showInfo('Please login to track progress');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/progress`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ course, module, completed: true })
        });

        if (response.ok) {
            showSuccess('Progress updated!');
            loadUserProgress();
        } else {
            showError('Failed to update progress');
        }
    } catch (error) {
        showError('Failed to update progress');
        console.error('Progress update error:', error);
    }
}

// ========================================
// TOOL FUNCTIONS
// ========================================

async function checkIP() {
    try {
        const response = await fetch(`${API_BASE}/api/tools/ip`);
        const data = await response.json();
        
        const resultDiv = document.getElementById('ipResult');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div style="margin-top: 15px; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 2px solid var(--success);">
                    <p><strong>IP Address:</strong> ${data.ipInfo.ip}</p>
                    <p><strong>Location:</strong> ${data.ipInfo.city}, ${data.ipInfo.region}, ${data.ipInfo.country}</p>
                </div>
            `;
        }
    } catch (error) {
        showError('Failed to check IP');
        console.error('IP check error:', error);
    }
}

async function checkPasswordStrength() {
    const password = document.getElementById('passwordInput')?.value;
    
    if (!password || password.length < 4) {
        document.getElementById('passwordResult').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/tools/password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await response.json();
        
        const resultDiv = document.getElementById('passwordResult');
        if (resultDiv) {
            let color = '#ef4444';
            if (data.score >= 80) color = '#10b981';
            else if (data.score >= 60) color = '#f59e0b';
            
            let feedbackHTML = data.feedback.length > 0 
                ? `<ul style="margin-top: 10px; padding-left: 20px;">${data.feedback.map(f => `<li>${f}</li>`).join('')}</ul>` 
                : '';
            
            resultDiv.innerHTML = `
                <div style="margin-top: 10px;">
                    <div style="background: ${color}; height: 5px; width: 100%; border-radius: 5px; margin-bottom: 5px;">
                        <div style="background: white; height: 5px; width: ${100 - data.score}%; border-radius: 5px;"></div>
                    </div>
                    <p style="margin-top: 5px; font-weight: 600;">
                        <span style="color: ${color};">${data.strength}</span> 
                        (${Math.round(data.score)}%)
                    </p>
                    ${feedbackHTML}
                </div>
            `;
        }
    } catch (error) {
        console.error('Password check failed:', error);
    }
}

function showVPNSimulator() {
    const vpnWindow = window.open('', '_blank', 'width=800,height=600');
    vpnWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>VPN Simulator</title>
            <style>
                body { font-family: Arial; padding: 20px; background: #f5f5f5; margin: 0; }
                .network { display: flex; justify-content: space-around; margin: 40px 0; position: relative; }
                .node { text-align: center; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 150px; }
                .line { position: relative; height: 2px; background: #e2e8f0; margin: 50px 0; }
                .encrypted { background: linear-gradient(90deg, #6366f1, #8b5cf6); height: 4px; position: absolute; top: -1px; left: 33%; width: 33%; }
                .label { position: absolute; top: -25px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; }
                .info { background: white; padding: 20px; border-radius: 10px; margin-top: 20px; }
                h2 { color: #6366f1; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h2>🔒 VPN Encryption Visualization</h2>
            <div class="network">
                <div class="node">
                    <h3>🏠 Your Device</h3>
                    <p>192.168.1.100</p>
                </div>
                <div class="node">
                    <h3>🔒 VPN Server</h3>
                    <p>203.0.113.45</p>
                </div>
                <div class="node">
                    <h3>🌐 Internet</h3>
                    <p>Public Network</p>
                </div>
            </div>
            <div class="line">
                <div class="encrypted">
                    <div class="label">Encrypted Tunnel</div>
                </div>
            </div>
            <div class="info">
                <h3>How VPN Works:</h3>
                <ol>
                    <li>Your data is encrypted before leaving your device</li>
                    <li>Encrypted data travels through secure tunnel to VPN server</li>
                    <li>VPN server decrypts and forwards to destination</li>
                    <li>Response follows same encrypted path back to you</li>
                </ol>
            </div>
        </body>
        </html>
    `);
}

// ========================================
// EVENT LISTENERS SETUP
// ========================================

function setupEventListeners() {
    // Auth buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) loginBtn.addEventListener('click', () => showModal('loginModal'));
    if (registerBtn) registerBtn.addEventListener('click', () => showModal('registerModal'));
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Course cards
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', () => {
            const course = card.dataset.course;
            if (course) {
                window.location.href = `courses/${course}.html`;
            }
        });
    });

    // Module completion buttons
    const completeBtns = document.querySelectorAll('[data-complete]');
    completeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const course = btn.dataset.course;
            const module = btn.dataset.module;
            if (course && module) {
                updateProgress(course, module);
            }
        });
    });

    // Close modals on click outside
    document.querySelectorAll('.auth-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function setupNavigation() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
}

function setupCourseCards() {
    // Add hover effects and click handlers
    const cards = document.querySelectorAll('.course-card, .module-card');
    cards.forEach(card => {
        card.style.cursor = 'pointer';
    });
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatCourseName(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function showError(message) {
    alert(`❌ Error: ${message}`);
}

function showSuccess(message) {
    alert(`✅ Success: ${message}`);
}

function showInfo(message) {
    alert(`ℹ️ ${message}`);
}

// ========================================
// QUIZ FUNCTIONS
// ========================================

function setupQuiz(quizId) {
    loadQuiz(quizId);
}

async function loadQuiz(quizId) {
    try {
        const response = await fetch(`${API_BASE}/api/quiz?id=${quizId}`);
        const data = await response.json();
        
        if (data.quiz && data.quiz.questions) {
            renderQuiz(data.quiz);
        } else {
            document.querySelector('.quiz-container').innerHTML = '<p>No quiz available</p>';
        }
    } catch (error) {
        console.error('Failed to load quiz:', error);
    }
}

function renderQuiz(quiz) {
    const container = document.querySelector('.quiz-container');
    if (!container) return;

    let html = `<h3>${quiz.title || 'Quiz'}</h3>`;
    
    quiz.questions.forEach((q, index) => {
        html += `
            <div class="quiz-question">
                <h4>Q${index + 1}: ${q.question}</h4>
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <div class="quiz-option" onclick="selectOption(this, ${index}, ${i})">
                            ${opt}
                        </div>
                    `).join('')}
                </div>
                <input type="hidden" id="answer-${index}" value="-1">
            </div>
        `;
    });

    html += `<button class="btn btn-primary" onclick="submitQuiz('${quiz.id}')">Submit Quiz</button>`;
    container.innerHTML = html;
}

function selectOption(element, questionIndex, optionIndex) {
    // Clear previous selection for this question
    const options = element.parentElement.querySelectorAll('.quiz-option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Select current option
    element.classList.add('selected');
    
    // Store answer
    document.getElementById(`answer-${questionIndex}`).value = optionIndex;
}

async function submitQuiz(quizId) {
    const answerInputs = document.querySelectorAll('[id^="answer-"]');
    const answers = Array.from(answerInputs).map(input => parseInt(input.value));
    
    // Check if all questions are answered
    if (answers.includes(-1)) {
        showError('Please answer all questions');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizId, answers })
        });

        const result = await response.json();
        showQuizResults(result);
    } catch (error) {
        showError('Failed to submit quiz');
        console.error('Quiz submission error:', error);
    }
}

function showQuizResults(result) {
    const container = document.querySelector('.quiz-container');
    if (!container) return;

    let html = `
        <div class="quiz-results">
            <h3>Quiz Results</h3>
            <p><strong>Score:</strong> ${result.score}/${result.total}</p>
            <p><strong>Percentage:</strong> ${Math.round(result.percentage)}%</p>
            <p><strong>Status:</strong> ${result.percentage >= 70 ? '✅ Passed' : '❌ Failed'}</p>
        </div>
    `;

    container.innerHTML = html;
}

// ========================================
// EXPORT FUNCTIONS FOR COURSE PAGES
// ========================================

window.cyberHub = {
    login,
    register,
    logout,
    updateProgress,
    checkIP,
    checkPasswordStrength,
    showVPNSimulator,
    setupQuiz,
    loadUserProgress
};
