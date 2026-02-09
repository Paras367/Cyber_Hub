// ========================================
// CYBERHUB - ENHANCED JAVASCRIPT
// Backend: https://cyber-hub.dhimanparas605.workers.dev
// ========================================

const API_BASE = 'https://cyber-hub.dhimanparas605.workers.dev';
const API_TIMEOUT = 15000;


let authToken = localStorage.getItem('authToken') || null;
let currentUser = null;
let lastActivity = Date.now();
const SESSION_TIMEOUT = 30 * 60 * 1000; 

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Initialize matrix background
    initMatrixBackground();
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Setup preloader
    setupPreloader();
    
    // Check authentication
    await checkAuthStatus();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize animations
    initAnimations();
    
    // Start session monitoring
    startSessionMonitoring();
    
    // Initialize terminal demo
    initTerminalDemo();
    
    console.log('%c🚀 CyberHub Initialized', 'color: #00f3ff; font-size: 16px; font-weight: bold;');
}

// ========================================
// MATRIX BACKGROUND
// ========================================

function initMatrixBackground() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
    
    function draw() {
        ctx.fillStyle = 'rgba(10, 14, 39, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00f3ff';
        ctx.font = fontSize + 'px JetBrains Mono';
        
        for (let i = 0; i < drops.length; i++) {
            const text = matrix.charAt(Math.floor(Math.random() * matrix.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
    }
    
    setInterval(draw, 35);
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========================================
// CUSTOM CURSOR
// ========================================

function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });
}

// ========================================
// PRELOADER
// ========================================

function setupPreloader() {
    const preloader = document.getElementById('preloader');
    const loadProgress = document.getElementById('loadProgress');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }, 500);
        }
        if (loadProgress) {
            loadProgress.textContent = Math.floor(progress);
        }
    }, 100);
}

// ========================================
// TERMINAL DEMO
// ========================================

function initTerminalDemo() {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    
    const commands = [
        { text: '$ initializing security scan...', delay: 500 },
        { text: '$ checking system vulnerabilities...', delay: 1000 },
        { text: '$ running port scanner on target 192.168.1.1', delay: 1500 },
        { text: '[+] Found 3 open ports: 22, 80, 443', delay: 2000 },
        { text: '$ analyzing web application security...', delay: 2500 },
        { text: '[+] Detected SQL injection vulnerability', delay: 3000 },
        { text: '[+] Detected XSS vulnerability', delay: 3500 },
        { text: '$ exploiting vulnerability...', delay: 4000 },
        { text: '[SUCCESS] Root access obtained!', delay: 4500 }
    ];
    
    let index = 0;
    
    function typeCommand() {
        if (index < commands.length) {
            setTimeout(() => {
                const line = document.createElement('div');
                line.textContent = commands[index].text;
                line.style.color = commands[index].text.includes('[SUCCESS]') ? '#39ff14' : 
                                 commands[index].text.includes('[+]') ? '#00f3ff' : 
                                 '#b4bcd0';
                output.appendChild(line);
                output.scrollTop = output.scrollHeight;
                index++;
                typeCommand();
            }, commands[index].delay - (index > 0 ? commands[index - 1].delay : 0));
        } else {
            // Reset and repeat
            setTimeout(() => {
                output.innerHTML = '';
                index = 0;
                typeCommand();
            }, 3000);
        }
    }
    
    typeCommand();
}

// ========================================
// COUNTERS
// ========================================

function initAnimations() {
    // Animate counters
    const counters = document.querySelectorAll('.counter');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const startTime = performance.now();
    
    function update(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const current = Math.floor(progress * target);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

// ========================================
// AUTHENTICATION
// ========================================

async function checkAuthStatus() {
    if (authToken) {
        await verifyToken();
    } else {
        updateAuthUI(false);
    }
}

async function verifyToken() {
    try {
        const response = await apiRequest(`${API_BASE}/api/progress`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.success && response.data.progress) {
            currentUser = { username: response.data.username };
            updateAuthUI(true);
            await loadProgress(response.data.progress);
        } else {
            logout();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        logout();
    }
}

async function login() {
    const username = document.getElementById('loginUsername')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (username.length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        return;
    }

    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await apiRequest(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.success) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = response.data.user;
            
            closeModal('loginModal');
            updateAuthUI(true);
            showToast(`Welcome back, ${currentUser.username}!`, 'success');
            
            await loadUserProgress();
        } else {
            showToast(response.data?.error || 'Invalid credentials', 'error');
        }
    } catch (error) {
        showToast('Login failed. Please try again.', 'error');
        console.error('Login error:', error);
    } finally {
        showLoading(false);
    }
}

async function register() {
    const username = document.getElementById('registerUsername')?.value?.trim();
    const email = document.getElementById('registerEmail')?.value?.trim();
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!username || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (username.length < 3 || username.length > 30) {
        showToast('Username must be 3-30 characters', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await apiRequest(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.success) {
            showToast('Account created successfully!', 'success');
            closeModal('registerModal');
            
            // Auto-fill login form
            if (document.getElementById('loginUsername')) {
                document.getElementById('loginUsername').value = username;
                document.getElementById('loginPassword').value = password;
                showModal('loginModal');
            }
        } else {
            showToast(response.data?.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Registration failed. Please try again.', 'error');
        console.error('Registration error:', error);
    } finally {
        showLoading(false);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    authToken = null;
    currentUser = null;
    updateAuthUI(false);
    showToast('Logged out successfully', 'success');
}

function updateAuthUI(isLoggedIn) {
    const userMenu = document.getElementById('userMenu');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userName = document.getElementById('userName');
    const userDashboard = document.getElementById('userDashboard');

    if (isLoggedIn && currentUser) {
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
        const response = await apiRequest(`${API_BASE}/api/progress`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.success) {
            await loadProgress(response.data.progress);
        }
    } catch (error) {
        console.error('Failed to load progress:', error);
    }
}

async function loadProgress(progress) {
    const contentDiv = document.getElementById('progressContent');
    if (!contentDiv) return;

    if (!progress || Object.keys(progress).length === 0) {
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-clipboard-list" style="font-size: 64px; color: #00f3ff; margin-bottom: 20px;"></i>
                <h3 style="color: #00f3ff; margin-bottom: 10px;">No Progress Yet</h3>
                <p style="color: #b4bcd0;">Start learning and track your progress here!</p>
                <button class="btn btn-primary" onclick="scrollToSection('courses')" style="margin-top: 20px;">
                    <i class="fas fa-graduation-cap"></i> BROWSE COURSES
                </button>
            </div>
        `;
        return;
    }

    // Display progress (simplified for now)
    contentDiv.innerHTML = `
        <div style="padding: 20px;">
            <p style="color: #00f3ff;">Progress loaded successfully!</p>
        </div>
    `;
}

// ========================================
// TOOLS
// ========================================

async function checkIP() {
    showLoading(true);

    try {
        const response = await apiRequest(`${API_BASE}/api/tools/ip`);
        
        if (response.success) {
            const ipInfo = response.data.ipInfo;
            const resultDiv = document.getElementById('ipResult');
            
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div style="padding: 15px;">
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #00f3ff;">IP Address:</strong> 
                            <span style="color: #39ff14;">${ipInfo.ip || 'Unknown'}</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #00f3ff;">Location:</strong> 
                            <span>${ipInfo.city || 'Unknown'}, ${ipInfo.region || 'Unknown'}, ${ipInfo.country || 'Unknown'}</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #00f3ff;">Country Code:</strong> 
                            <span>${ipInfo.country || 'N/A'}</span>
                        </div>
                        <div style="padding: 10px; background: rgba(0, 243, 255, 0.1); border-radius: 4px; margin-top: 15px;">
                            <i class="fas fa-shield-halved"></i> 
                            <span style="font-size: 12px;">Use a VPN for enhanced privacy</span>
                        </div>
                    </div>
                `;
                resultDiv.classList.add('show');
            }
        }
    } catch (error) {
        showToast('Failed to check IP. Please try again.', 'error');
        console.error('IP check error:', error);
    } finally {
        showLoading(false);
    }
}

function togglePasswordVisibility() {
    const input = document.getElementById('passwordInput');
    const btn = event.currentTarget;
    
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        btn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function showVPNSimulator() {
    const vpnWindow = window.open('', '_blank', 'width=900,height=700');
    vpnWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>VPN Encryption Visualizer - CyberHub</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'JetBrains Mono', monospace;
                    background: linear-gradient(135deg, #0a0e27, #121829);
                    color: #fff;
                    padding: 40px;
                }
                h1 {
                    color: #00f3ff;
                    text-align: center;
                    margin-bottom: 40px;
                    font-size: 32px;
                    text-shadow: 0 0 20px #00f3ff;
                }
                .diagram {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    margin: 50px 0;
                }
                .node {
                    width: 150px;
                    height: 150px;
                    background: rgba(0, 243, 255, 0.1);
                    border: 2px solid #00f3ff;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 20px;
                    box-shadow: 0 0 20px rgba(0, 243, 255, 0.3);
                }
                .node i {
                    font-size: 40px;
                    margin-bottom: 10px;
                    color: #00f3ff;
                }
                .arrow {
                    font-size: 40px;
                    color: #9d00ff;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .info {
                    background: rgba(0, 243, 255, 0.05);
                    border: 1px solid #00f3ff;
                    border-radius: 8px;
                    padding: 30px;
                    margin-top: 40px;
                }
                .info h2 {
                    color: #00f3ff;
                    margin-bottom: 20px;
                }
                .info ol {
                    line-height: 2;
                }
                .info li {
                    margin-bottom: 10px;
                }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
        </head>
        <body>
            <h1>VPN ENCRYPTION VISUALIZER</h1>
            
            <div class="diagram">
                <div class="node">
                    <i class="fas fa-laptop"></i>
                    <div>Your Device</div>
                    <small>192.168.1.100</small>
                </div>
                
                <div class="arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
                
                <div class="node">
                    <i class="fas fa-shield-halved"></i>
                    <div>VPN Server</div>
                    <small>ENCRYPTED</small>
                </div>
                
                <div class="arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
                
                <div class="node">
                    <i class="fas fa-globe"></i>
                    <div>Internet</div>
                    <small>Destination</small>
                </div>
            </div>
            
            <div class="info">
                <h2>HOW VPN WORKS:</h2>
                <ol>
                    <li><strong>Encryption:</strong> Your data is encrypted before leaving your device</li>
                    <li><strong>Tunneling:</strong> Encrypted data travels through a secure tunnel to the VPN server</li>
                    <li><strong>Decryption:</strong> VPN server decrypts and forwards your request</li>
                    <li><strong>Privacy:</strong> Your real IP is hidden, server's IP is visible to websites</li>
                    <li><strong>Security:</strong> All traffic is protected with military-grade encryption</li>
                </ol>
            </div>
        </body>
        </html>
    `);
}

async function generateHash() {
    const text = document.getElementById('hashInput')?.value;
    const hashType = document.getElementById('hashType')?.value || 'sha256';
    const resultDiv = document.getElementById('hashResult');
    
    if (!text) {
        showToast('Please enter text to hash', 'error');
        return;
    }
    
    try {
        let hash;
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        
        if (hashType === 'sha256') {
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            hash = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        } else if (hashType === 'sha512') {
            const hashBuffer = await crypto.subtle.digest('SHA-512', data);
            hash = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        } else {
            // Simple MD5 simulation (not cryptographically secure)
            hash = 'MD5 hashing requires external library';
        }
        
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div style="padding: 15px;">
                    <strong style="color: #00f3ff;">${hashType.toUpperCase()} Hash:</strong><br>
                    <code style="word-break: break-all; color: #39ff14; font-size: 12px;">${hash}</code>
                </div>
            `;
            resultDiv.classList.add('show');
        }
    } catch (error) {
        showToast('Hash generation failed', 'error');
    }
}

function scanPorts() {
    showToast('Port scanning is for demonstration purposes only', 'warning');
    const resultDiv = document.getElementById('scanResult');
    
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div style="padding: 15px;">
                <div style="margin-bottom: 10px; color: #39ff14;">
                    <i class="fas fa-check"></i> Port 22 (SSH) - OPEN
                </div>
                <div style="margin-bottom: 10px; color: #39ff14;">
                    <i class="fas fa-check"></i> Port 80 (HTTP) - OPEN
                </div>
                <div style="margin-bottom: 10px; color: #39ff14;">
                    <i class="fas fa-check"></i> Port 443 (HTTPS) - OPEN
                </div>
                <div style="margin-bottom: 10px; color: #6b7a99;">
                    <i class="fas fa-times"></i> Port 3306 (MySQL) - CLOSED
                </div>
                <div style="margin-top: 15px; padding: 10px; background: rgba(0, 243, 255, 0.1); border-radius: 4px;">
                    <i class="fas fa-info-circle"></i> Demo scan completed
                </div>
            </div>
        `;
        resultDiv.classList.add('show');
    }
}

// ========================================
// API REQUESTS
// ========================================

async function apiRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
            mode: 'cors',
            credentials: 'omit'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `HTTP error! status: ${response.status}` };
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data,
            status: response.status
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please try again.');
        }
        console.error('API Request Error:', error);
        throw error;
    }
}

// ========================================
// UI UTILITIES
// ========================================

function showLoading(show) {
    let overlay = document.getElementById('loadingOverlay');
    
    if (show) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 3px solid rgba(0, 243, 255, 0.3); border-top-color: #00f3ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: #00f3ff; margin-top: 20px; font-family: 'Orbitron', sans-serif;">PROCESSING...</p>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
    } else if (overlay) {
        overlay.remove();
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

function switchModal(fromId, toId) {
    closeModal(fromId);
    setTimeout(() => showModal(toId), 300);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-exclamation-circle' : 
                          type === 'warning' ? 'fa-exclamation-triangle' : 
                          'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Auth buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const ctaRegisterBtn = document.getElementById('ctaRegisterBtn');

    if (loginBtn) loginBtn.addEventListener('click', () => showModal('loginModal'));
    if (registerBtn) registerBtn.addEventListener('click', () => showModal('registerModal'));
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (ctaRegisterBtn) ctaRegisterBtn.addEventListener('click', () => showModal('registerModal'));

    // Scroll to top
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                scrollToSection(targetId.substring(1));
                
                // Update active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            // Toggle mobile menu (implement as needed)
            console.log('Mobile menu toggle');
        });
    }

    // Password input real-time checking
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            // Add password strength checking if needed
        });
    }

    // Register password strength
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', function() {
            const strength = getPasswordStrength(this.value);
            const strengthDiv = document.getElementById('registerPasswordStrength');
            if (strengthDiv) {
                strengthDiv.innerHTML = `
                    <div style="margin-top: 10px;">
                        <div style="height: 4px; background: rgba(0, 243, 255, 0.2); border-radius: 2px; overflow: hidden;">
                            <div style="height: 100%; width: ${strength.score}%; background: ${
                                strength.score >= 80 ? '#39ff14' :
                                strength.score >= 60 ? '#ffff00' :
                                strength.score >= 40 ? '#ff9d00' :
                                '#ff0055'
                            }; transition: all 0.3s ease;"></div>
                        </div>
                        <p style="margin-top: 5px; font-size: 12px; color: ${
                            strength.score >= 80 ? '#39ff14' :
                            strength.score >= 60 ? '#ffff00' :
                            strength.score >= 40 ? '#ff9d00' :
                            '#ff0055'
                        };">${strength.level}</p>
                    </div>
                `;
            }
        });
    }
}

// ========================================
// UTILITIES
// ========================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 80; // Navbar height
        const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function getPasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 12) score += 30;
    else if (password.length >= 8) score += 20;
    
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    
    score = Math.max(0, Math.min(100, score));
    
    let level = 'Weak';
    if (score >= 80) level = 'Strong';
    else if (score >= 60) level = 'Good';
    else if (score >= 40) level = 'Moderate';
    
    return { score, level };
}

function startSessionMonitoring() {
    setInterval(() => {
        if (authToken && Date.now() - lastActivity > SESSION_TIMEOUT) {
            logout();
            showToast('Session expired due to inactivity', 'warning');
        }
    }, 60000);
    
    // Update last activity
    document.addEventListener('mousemove', () => { lastActivity = Date.now(); });
    document.addEventListener('keypress', () => { lastActivity = Date.now(); });
    document.addEventListener('click', () => { lastActivity = Date.now(); });
}

function exportProgress() {
    showToast('Progress export feature coming soon', 'info');
}


window.cyberHub = {
    login,
    register,
    logout,
    checkIP,
    showVPNSimulator,
    generateHash,
    scanPorts,
    togglePasswordVisibility,
    showModal,
    closeModal,
    switchModal,
    scrollToSection
};

console.log('%c🔒 CyberHub API Ready', 'color: #00f3ff; font-size: 14px; font-weight: bold;');
console.log('%c📡 Backend:', 'color: #9d00ff;', API_BASE);
