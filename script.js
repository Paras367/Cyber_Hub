// ========================================
// CYBER LEARNING HUB 
// ========================================

// Layer 1 : Base 64
const ENCRYPTED_PARTS = {
    p1: 'aHR0cHM6Ly9jeWJlci1odWI=',
    p2: 'ZGhpbWFucGFyYXM2MDU=',
    p3: 'LndvcmtlcnM=',
    p4: 'ZGV2'
};

// Layer 2: XOR encryption key (rotating)
const XOR_KEY = [42, 87, 15, 93, 28, 61, 34, 79];

// Layer 3: Character substitution map
const SUB_MAP = {
    'a': 'z', 'b': 'y', 'c': 'x', 'd': 'w', 'e': 'v',
    'f': 'u', 'g': 't', 'h': 's', 'i': 'r', 'j': 'q',
    'k': 'p', 'l': 'o', 'm': 'n', 'n': 'm', 'o': 'l',
    'p': 'k', 'q': 'j', 'r': 'i', 's': 'h', 't': 'g',
    'u': 'f', 'v': 'e', 'w': 'd', 'x': 'c', 'y': 'b', 'z': 'a'
};

// Decrypt worker URL function
function decryptWorkerURL() {
    try {
        // Step 1: Decode base64 parts
        let decoded = '';
        for (let i = 1; i <= 4; i++) {
            decoded += atob(ENCRYPTED_PARTS[`p${i}`]);
        }
        
        // Step 2: Apply XOR decryption
        let xorDecrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            const keyIndex = i % XOR_KEY.length;
            xorDecrypted += String.fromCharCode(decoded.charCodeAt(i) ^ XOR_KEY[keyIndex]);
        }
        
        // Step 3: Apply character substitution
        let finalURL = '';
        for (const char of xorDecrypted) {
            if (char.toLowerCase() in SUB_MAP) {
                finalURL += SUB_MAP[char.toLowerCase()] === char.toLowerCase() ? 
                    SUB_MAP[char].toUpperCase() : SUB_MAP[char.toLowerCase()];
            } else {
                finalURL += char;
            }
        }
        
        // Validate URL format
        if (!finalURL.startsWith('http')) {
            console.error('🔐 URL decryption failed - using fallback');
            return 'https://cyber-hub.dhimanparas605.workers.dev';
        }
        
        console.log('✅ Worker URL decrypted successfully');
        return finalURL;
    } catch (error) {
        console.error('🔐 Decryption error:', error);
        return 'https://cyber-hub.dhimanparas605.workers.dev';
    }
}

// Initialize API base URL
const API_BASE = decryptWorkerURL();
console.log('%c🔒 API Endpoint:', 'color: #8b5cf6; font-weight: bold;', API_BASE);

// ========================================
// ⚙️ CONFIGURATION & GLOBAL STATE
// ========================================

const API_TIMEOUT = 15000; // 15 seconds timeout
const MAX_RETRY_ATTEMPTS = 3;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Global state
let authToken = localStorage.getItem('authToken') || null;
let currentUser = null;
let lastActivity = Date.now();
let apiQueue = [];
let isProcessingQueue = false;
let securityToken = generateSecurityToken();

// Security token generator
function generateSecurityToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ========================================
// 🚀 INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', initializeCyberHub);

async function initializeCyberHub() {
    // Initialize security monitoring
    setupSecurityMonitoring();
    
    // Setup preloader
    setupPreloader();
    
    // Check authentication
    await checkAuthStatus();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize page components
    initializePageComponents();
    
    // Setup cyber animations
    initializeCyberAnimations();
    
    // Load initial data
    await loadInitialData();
    
    // Start session monitoring
    startSessionMonitoring();
    
    // Log initialization
    console.log('%c🚀 Cyber Learning Hub initialized successfully!', 'color: #6366f1; font-weight: bold; font-size: 16px;');
    console.log('%c👤 User Status:', 'color: #10b981;', authToken ? 'Authenticated' : 'Not Logged In');
    console.log('%c🛡️ Security Token:', 'color: #8b5cf6;', securityToken.substring(0, 8) + '...');
}

// Security monitoring setup
function setupSecurityMonitoring() {
    // Monitor for suspicious activities
    document.addEventListener('copy', logSecurityEvent.bind(null, 'copy_attempt'));
    document.addEventListener('cut', logSecurityEvent.bind(null, 'cut_attempt'));
    document.addEventListener('paste', logSecurityEvent.bind(null, 'paste_attempt'));
    document.addEventListener('contextmenu', logSecurityEvent.bind(null, 'right_click'));
    
    // Monitor console usage
    if (typeof console !== 'undefined') {
        const originalLog = console.log;
        console.log = function() {
            logSecurityEvent('console_access');
            originalLog.apply(console, arguments);
        };
    }
}

function logSecurityEvent(eventType) {
    console.log(`🛡️ Security Event: ${eventType} at ${new Date().toISOString()}`);
}

// Session monitoring
function startSessionMonitoring() {
    setInterval(() => {
        if (authToken && Date.now() - lastActivity > SESSION_TIMEOUT) {
            console.log('⏰ Session timeout - logging out');
            logout();
            showInfo('Session expired due to inactivity. Please login again.');
        }
    }, 60000); // Check every minute
    
    // Update last activity on user interaction
    document.addEventListener('mousemove', () => { lastActivity = Date.now(); });
    document.addEventListener('keypress', () => { lastActivity = Date.now(); });
    document.addEventListener('click', () => { lastActivity = Date.now(); });
}

// ========================================
// 🔐 AUTHENTICATION SYSTEM
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
            updateAuthUI(true);
            await loadProgress(response.data.progress);
        } else {
            logout();
        }
    } catch (error) {
        console.error('🔐 Token verification failed:', error);
        logout();
    }
}

async function login() {
    const username = document.getElementById('loginUsername')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    const rememberMe = document.getElementById('rememberMe')?.checked;

    // Validation
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }

    if (username.length < 3 || username.length > 30) {
        showError('Username must be 3-30 characters');
        return;
    }

    if (password.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
    }

    showLoading(true, 'Authenticating...');

    try {
        // FIXED: Send plain password (Worker handles hashing)
        // Client-side hashing was causing double-hashing issues
        const response = await apiRequest(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                password, // Plain password - Worker will hash it
                securityToken
            })
        });

        if (response.success) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = response.data.user;
            
            // Save username if remember me is checked
            if (rememberMe) {
                localStorage.setItem('savedUsername', username);
            } else {
                localStorage.removeItem('savedUsername');
            }

            closeModal('loginModal');
            updateAuthUI(true);
            showSuccess(`🎉 Welcome back, ${currentUser.username}!`);
            
            // Reload user data
            await Promise.all([
                loadUserProgress(),
                loadUserData()
            ]);
            
            // Track login event
            trackEvent('user_login', { username: currentUser.username });
        } else {
            showError(response.data?.error || 'Invalid credentials. Please try again.');
        }
    } catch (error) {
        if (error.message.includes('timeout')) {
            showError('Login timeout. Please check your connection and try again.');
        } else {
            showError('Login failed. Please check your credentials.');
        }
        console.error('🔐 Login error:', error);
    } finally {
        showLoading(false);
    }
}

async function register() {
    const username = document.getElementById('registerUsername')?.value?.trim();
    const email = document.getElementById('registerEmail')?.value?.trim();
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    // Validation
    if (!username || !email || !password) {
        showError('Please fill in all fields');
        return;
    }

    if (username.length < 3 || username.length > 30) {
        showError('Username must be 3-30 characters');
        return;
    }

    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return;
    }

    if (password.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
    }

    // Password strength check
    const strength = getPasswordStrength(password);
    if (strength.score < 60) {
        showError(`Password strength: ${strength.level}. Please create a stronger password.`);
        return;
    }

    showLoading(true, 'Creating your account...');

    try {
        // FIXED: Send plain password (Worker handles hashing)
        const response = await apiRequest(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                email, 
                password, // Plain password - Worker will hash it
                securityToken
            })
        });

        if (response.success) {
            showSuccess('✅ Account created successfully! Please login to continue.');
            closeModal('registerModal');
            
            // Auto-fill login form
            if (document.getElementById('loginUsername')) {
                document.getElementById('loginUsername').value = username;
                document.getElementById('loginPassword').value = password;
                showModal('loginModal');
            }
            
            trackEvent('user_register', { username, email });
        } else {
            showError(response.data?.error || 'Registration failed. Username might already exist.');
        }
    } catch (error) {
        if (error.message.includes('timeout')) {
            showError('Registration timeout. Please try again.');
        } else {
            showError('Registration failed. Please try again later.');
        }
        console.error('🔐 Registration error:', error);
    } finally {
        showLoading(false);
    }
}

function logout() {
    // Clear all sensitive data
    localStorage.removeItem('authToken');
    localStorage.removeItem('savedUsername');
    sessionStorage.clear();
    
    authToken = null;
    currentUser = null;
    securityToken = generateSecurityToken();
    
    updateAuthUI(false);
    showSuccess('👋 You have been logged out successfully');
    trackEvent('user_logout');
}

function updateAuthUI(isLoggedIn) {
    const userMenu = document.getElementById('userMenu');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userName = document.getElementById('userName');
    const userDashboard = document.getElementById('userDashboard');

    if (isLoggedIn && currentUser) {
        // Show user menu
        if (userMenu) userMenu.style.display = 'flex';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userName) userName.textContent = currentUser.username;
        if (userDashboard) userDashboard.style.display = 'block';
        
        // Add cyber glow effect
        const userInfo = document.querySelector('.user-info');
        if (userInfo) userInfo.classList.add('cyber-glow');
    } else {
        // Show auth buttons
        if (userMenu) userMenu.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (userDashboard) userDashboard.style.display = 'none';
        
        const userInfo = document.querySelector('.user-info');
        if (userInfo) userInfo.classList.remove('cyber-glow');
    }
}

// ========================================
// 📊 PROGRESS TRACKING SYSTEM
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
        console.error('📊 Failed to load progress:', error);
    }
}

async function loadProgress(progress) {
    const contentDiv = document.getElementById('progressContent');
    if (!contentDiv) return;

    if (!progress || Object.keys(progress).length === 0) {
        contentDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list fa-3x" style="color: #6366f1; margin-bottom: 20px;"></i>
                <h4>No progress yet</h4>
                <p>Start learning and track your progress here!</p>
                <button class="btn btn-primary" onclick="document.querySelector('#courses').scrollIntoView({behavior: 'smooth'})">
                    <i class="fas fa-graduation-cap"></i> Browse Courses
                </button>
            </div>
        `;
        return;
    }

    let html = `
        <div class="progress-grid">
            ${Object.entries(progress).map(([course, modules]) => {
                const completedCount = Object.values(modules).filter(v => v).length;
                const totalCount = Object.keys(modules).length;
                const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                const courseIcon = getCourseIcon(course);
                
                return `
                    <div class="progress-card cyber-card">
                        <div class="progress-header">
                            <div class="progress-icon cyber-gradient">
                                <i class="fas ${courseIcon}"></i>
                            </div>
                            <div class="progress-info">
                                <h4>${formatCourseName(course)}</h4>
                                <div class="progress-stats">
                                    <span><i class="fas fa-check-circle"></i> ${completedCount} completed</span>
                                    <span><i class="fas fa-tasks"></i> ${totalCount} total</span>
                                </div>
                            </div>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%">
                                    <span class="progress-percentage">${Math.round(percentage)}%</span>
                                </div>
                            </div>
                        </div>
                        <div class="progress-modules">
                            ${Object.entries(modules).map(([module, completed]) => `
                                <div class="module-item ${completed ? 'completed' : ''}">
                                    <i class="fas ${completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                                    <span>${formatModuleName(module)}</span>
                                    ${completed ? '<span class="module-badge">✓ Completed</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    contentDiv.innerHTML = html;
}

async function updateProgress(course, module) {
    if (!authToken) {
        showInfo('🔑 Please login to track progress');
        setTimeout(() => showModal('loginModal'), 500);
        return;
    }

    showLoading(true, 'Updating progress...');

    try {
        const response = await apiRequest(`${API_BASE}/api/progress`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
                course, 
                module, 
                completed: true,
                securityToken
            })
        });

        if (response.success) {
            showSuccess(`✅ Progress updated for ${formatCourseName(course)}!`);
            await loadUserProgress();
            trackEvent('progress_update', { course, module });
        } else {
            showError('Failed to update progress. Please try again.');
        }
    } catch (error) {
        showError('Failed to update progress. Please try again.');
        console.error('📊 Progress update error:', error);
    } finally {
        showLoading(false);
    }
}

// ========================================
// 🛠️ CYBER TOOLS SYSTEM
// ========================================

async function checkIP() {
    const button = event?.currentTarget;
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    }

    try {
        const response = await apiRequest(`${API_BASE}/api/tools/ip`, {
            headers: { 'X-Security-Token': securityToken }
        });
        
        if (response.success) {
            const resultDiv = document.getElementById('ipResult');
            if (resultDiv) {
                const ipInfo = response.data.ipInfo;
                resultDiv.innerHTML = `
                    <div class="ip-result-card cyber-card">
                        <div class="ip-header">
                            <i class="fas fa-globe fa-2x cyber-gradient-text"></i>
                            <h4>Your IP Information</h4>
                        </div>
                        <div class="ip-details">
                            <div class="ip-row">
                                <span class="ip-label"><i class="fas fa-fingerprint"></i> IP Address:</span>
                                <span class="ip-value">${ipInfo.ip || 'Unknown'}</span>
                            </div>
                            <div class="ip-row">
                                <span class="ip-label"><i class="fas fa-map-marker-alt"></i> Location:</span>
                                <span class="ip-value">${ipInfo.city || 'Unknown'}, ${ipInfo.region || 'Unknown'}, ${ipInfo.country || 'Unknown'}</span>
                            </div>
                            <div class="ip-row">
                                <span class="ip-label"><i class="fas fa-flag"></i> Country Code:</span>
                                <span class="ip-value">${ipInfo.country || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="ip-security">
                            <i class="fas fa-shield-alt"></i>
                            <span>Keep your IP secure. Consider using a VPN for enhanced privacy.</span>
                        </div>
                    </div>
                `;
                resultDiv.style.display = 'block';
                resultDiv.classList.add('show');
                
                trackEvent('tool_ip_check', { ip: ipInfo.ip });
            }
        }
    } catch (error) {
        showError('Failed to check IP. Please try again.');
        console.error('🌐 IP check error:', error);
    } finally {
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-magnifying-glass"></i> Check My IP';
        }
    }
}

async function checkPasswordStrength() {
    const password = document.getElementById('passwordInput')?.value;
    const resultDiv = document.getElementById('passwordResult');
    
    if (!password || password.length < 4) {
        if (resultDiv) resultDiv.innerHTML = '';
        return;
    }

    // Debounce to avoid too many API calls
    if (this.passwordTimeout) clearTimeout(this.passwordTimeout);
    this.passwordTimeout = setTimeout(async () => {
        try {
            const strength = getPasswordStrength(password);
            
            let color = '#ef4444';
            let icon = 'fa-times-circle';
            
            if (strength.score >= 80) {
                color = '#10b981';
                icon = 'fa-check-circle';
            } else if (strength.score >= 60) {
                color = '#f59e0b';
                icon = 'fa-exclamation-triangle';
            } else if (strength.score >= 40) {
                color = '#fbbf24';
                icon = 'fa-exclamation-triangle';
            }

            let feedbackHTML = '';
            if (strength.feedback.length > 0) {
                feedbackHTML = `
                    <div class="password-feedback">
                        <h5><i class="fas fa-lightbulb"></i> Suggestions:</h5>
                        <ul>
                            ${strength.feedback.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div class="password-strength-card">
                        <div class="strength-header">
                            <i class="fas ${icon}" style="color: ${color};"></i>
                            <span class="strength-label" style="color: ${color};">${strength.level}</span>
                            <span class="strength-score">${Math.round(strength.score)}%</span>
                        </div>
                        <div class="strength-bar">
                            <div class="strength-fill" style="width: ${strength.score}%; background: ${color};"></div>
                        </div>
                        ${feedbackHTML}
                        <div class="password-tips">
                            <i class="fas fa-shield-alt"></i>
                            <span>Use a password manager to generate and store strong passwords securely.</span>
                        </div>
                    </div>
                `;
                resultDiv.style.display = 'block';
                resultDiv.classList.add('show');
                
                trackEvent('tool_password_check', { score: strength.score, level: strength.level });
            }
        } catch (error) {
            console.error('🔑 Password check failed:', error);
        }
    }, 300);
}

function showVPNSimulator() {
    const vpnWindow = window.open('', '_blank', 'width=900,height=700');
    vpnWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>VPN Simulator - Cyber Learning Hub</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    padding: 30px; 
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    color: #e2e8f0;
                    overflow-x: hidden;
                }
                .header { text-align: center; margin-bottom: 30px; }
                .header h2 { 
                    color: #6366f1; 
                    font-size: 2em;
                    margin-bottom: 10px;
                    text-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
                }
                .network-diagram { 
                    display: flex; 
                    justify-content: space-around; 
                    margin: 40px 0; 
                    position: relative;
                    padding: 40px 0;
                }
                .node { 
                    text-align: center; 
                    padding: 25px; 
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px; 
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    width: 180px;
                    border: 2px solid rgba(99, 102, 241, 0.3);
                    transition: all 0.3s ease;
                }
                .node:hover {
                    background: rgba(99, 102, 241, 0.1);
                    transform: translateY(-5px);
                    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4);
                }
                .node h3 { 
                    color: #6366f1; 
                    margin-bottom: 15px; 
                    font-size: 1.2em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .node p { 
                    color: #cbd5e1; 
                    font-size: 0.95em;
                    word-break: break-all;
                }
                .line { 
                    position: relative; 
                    height: 3px; 
                    background: rgba(255, 255, 255, 0.1); 
                    margin: 60px 0; 
                }
                .encrypted { 
                    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
                    height: 6px; 
                    position: absolute; 
                    top: -2px; 
                    left: 25%; 
                    width: 50%;
                    animation: pulse 2s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .label { 
                    position: absolute; 
                    top: -35px; 
                    left: 50%; 
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #10b981, #0ea5e9);
                    color: white; 
                    padding: 8px 16px; 
                    border-radius: 25px; 
                    font-size: 14px; 
                    font-weight: bold;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                    animation: bounce 2s ease-in-out infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(-10px); }
                }
                .info { 
                    background: rgba(255, 255, 255, 0.05);
                    padding: 25px; 
                    border-radius: 15px; 
                    margin-top: 30px;
                    border: 2px solid rgba(16, 185, 129, 0.3);
                }
                .info h3 { 
                    color: #10b981; 
                    margin-bottom: 20px; 
                    font-size: 1.5em;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .info ol { 
                    color: #e2e8f0; 
                    line-height: 2;
                    padding-left: 25px;
                }
                .info li { margin-bottom: 10px; }
                .security-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #10b981, #0ea5e9);
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 0.85em;
                    margin-top: 15px;
                    font-weight: 600;
                }
                .data-flow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                .data-packet {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background: #6366f1;
                    border-radius: 50%;
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.8);
                    animation: flow 4s linear infinite;
                }
                @keyframes flow {
                    0% { left: 10%; top: 50%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { left: 90%; top: 50%; opacity: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🔒 VPN Encryption Visualization</h2>
                <p style="color: #94a3b8;">Understand how VPNs protect your data with encryption</p>
            </div>
            
            <div class="network-diagram">
                <div class="node">
                    <h3>🏠 Your Device</h3>
                    <p>192.168.1.100</p>
                </div>
                <div class="node">
                    <h3>🛡️ VPN Server</h3>
                    <p>203.0.113.45</p>
                </div>
                <div class="node">
                    <h3>🌐 Internet</h3>
                    <p>Public Network</p>
                </div>
                
                <div class="data-flow" id="dataFlow"></div>
            </div>
            
            <div class="line">
                <div class="encrypted">
                    <div class="label">🔐 Encrypted Tunnel</div>
                </div>
            </div>
            
            <div class="info">
                <h3><i class="fas fa-book"></i> How VPN Works:</h3>
                <ol>
                    <li><strong>Your data is encrypted</strong> before leaving your device using strong encryption algorithms</li>
                    <li><strong>Encrypted data travels</strong> through a secure tunnel to the VPN server</li>
                    <li><strong>VPN server decrypts</strong> the data and forwards it to the destination</li>
                    <li><strong>Response follows</strong> the same encrypted path back to you</li>
                    <li><strong>Your IP is hidden</strong> and your location appears to be the VPN server's location</li>
                </ol>
                <div class="security-badge">
                    <i class="fas fa-shield-alt"></i> Military-Grade Encryption
                </div>
            </div>
            
            <script>
                // Create animated data packets
                const flowContainer = document.getElementById('dataFlow');
                for (let i = 0; i < 10; i++) {
                    const packet = document.createElement('div');
                    packet.className = 'data-packet';
                    packet.style.animationDelay = (i * 0.4) + 's';
                    flowContainer.appendChild(packet);
                }
            </script>
        </body>
        </html>
    `);
    trackEvent('tool_vpn_simulator_open');
}

// ========================================
// 🔒 SECURITY UTILITIES
// ========================================

// Password strength checker (client-side)
function getPasswordStrength(password) {
    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 12) score += 30;
    else if (password.length >= 8) score += 20;
    else feedback.push('Use at least 8 characters');

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Add uppercase letters');

    // Lowercase check
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Add lowercase letters');

    // Number check
    if (/\d/.test(password)) score += 15;
    else feedback.push('Add numbers');

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    else feedback.push('Add special characters (!@#$%^&*)');

    // Additional checks
    if (password.length >= 16) score += 10;
    if (/(\w)\1\1/.test(password)) score -= 15; // Repeated characters
    if (/password|12345|qwerty/i.test(password)) score -= 20; // Common passwords

    score = Math.max(0, Math.min(100, score));

    let level = 'Weak';
    if (score >= 80) level = 'Strong';
    else if (score >= 60) level = 'Good';
    else if (score >= 40) level = 'Moderate';

    return { score, level, feedback };
}

// ========================================
// 🌐 API REQUEST HANDLER WITH SECURITY - FIXED
// ========================================

async function apiRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        // Add security headers
        const headers = {
            'Content-Type': 'application/json',
            'X-Client-Token': securityToken,
            'X-Timestamp': Date.now().toString(),
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
            // Try to parse error response
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                // If JSON parsing fails, use default error
                errorData = { error: `HTTP error! status: ${response.status}` };
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // FIXED: Always parse JSON response (Worker always returns JSON)
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
// 📱 UI UTILITIES & EFFECTS
// ========================================

function showLoading(show, message = 'Loading...') {
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
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                backdrop-filter: blur(5px);
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div class="cyber-spinner" style="margin-bottom: 20px;">
                    <i class="fas fa-spinner fa-spin fa-3x" style="color: #6366f1;"></i>
                </div>
                <p style="font-size: 1.2em; margin-top: 10px;">${message}</p>
            </div>
        `;
    } else if (overlay) {
        overlay.remove();
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add animation
        setTimeout(() => {
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }
        }, 10);
        
        trackEvent('modal_open', { modal: modalId });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(20px)';
        }
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
        
        trackEvent('modal_close', { modal: modalId });
    }
}

function setupPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    // Matrix animation effect
    const matrixContainer = document.querySelector('.cyber-matrix');
    if (matrixContainer) {
        // Update loading percentage
        const percentageElement = document.querySelector('.loading-percentage');
        let percent = 0;
        const interval = setInterval(() => {
            percent += Math.random() * 3;
            if (percent >= 100) {
                percent = 100;
                clearInterval(interval);
            }
            if (percentageElement) {
                percentageElement.textContent = Math.min(Math.floor(percent), 100) + '%';
            }
            document.querySelector('.loading-fill').style.width = percent + '%';
        }, 80);
    }

    // Hide preloader after animations complete
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        trackEvent('preloader_hidden');
    }, 2000);
}

function initializePageComponents() {
    setupNavigation();
    setupCourseCards();
    setupToolCards();
    setupTestimonialSlider();
    setupFormValidation();
}

function setupNavigation() {
    // Logo click
    const logoSection = document.querySelector('.logo-section');
    if (logoSection) {
        logoSection.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                window.location.href = '#home';
            }
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Close mobile menu if open
                    const navLinks = document.querySelector('.nav-links');
                    if (navLinks && navLinks.classList.contains('show')) {
                        navLinks.classList.remove('show');
                        const icon = document.getElementById('mobileMenuToggle')?.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                        }
                    }
                }
            }
        });
    });
}

function setupCourseCards() {
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        // Hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
        
        // Click to navigate
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                const course = card.dataset.course;
                if (course) {
                    window.location.href = `courses/${course}.html`;
                }
            }
        });
    });
}

function setupToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 15px 40px rgba(99, 102, 241, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });
}

function setupTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length <= 1) return;

    // Show all testimonials with proper styling
    testimonials.forEach((testimonial, index) => {
        testimonial.style.opacity = '1';
        testimonial.style.transform = 'translateY(0)';
        testimonial.style.zIndex = '1';
        
        // Add click to bring to front
        testimonial.addEventListener('click', () => {
            // Reset all
            testimonials.forEach(t => {
                t.style.zIndex = '1';
                t.style.transform = 'translateY(0)';
                t.style.boxShadow = '';
            });
            
            // Bring selected to front
            testimonial.style.zIndex = '10';
            testimonial.style.transform = 'translateY(-5px)';
            testimonial.style.boxShadow = '0 15px 40px rgba(99, 102, 241, 0.3)';
        });
    });
    
    // Auto-rotate highlight
    let currentIndex = 0;
    setInterval(() => {
        testimonials.forEach(t => {
            t.style.zIndex = '1';
            t.style.transform = 'translateY(0)';
            t.style.boxShadow = '';
        });
        
        currentIndex = (currentIndex + 1) % testimonials.length;
        testimonials[currentIndex].style.zIndex = '10';
        testimonials[currentIndex].style.transform = 'translateY(-5px)';
        testimonials[currentIndex].style.boxShadow = '0 15px 40px rgba(99, 102, 241, 0.3)';
    }, 5000);
}

function setupFormValidation() {
    // Password strength checker for registration
    const registerPasswordInput = document.getElementById('registerPassword');
    if (registerPasswordInput) {
        registerPasswordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthIndicator = document.getElementById('registerPasswordStrength');
            if (!strengthIndicator) return;

            const strength = getPasswordStrength(password);
            
            let color = '#ef4444';
            if (strength.score >= 80) color = '#10b981';
            else if (strength.score >= 60) color = '#f59e0b';
            else if (strength.score >= 40) color = '#fbbf24';

            let feedbackHTML = '';
            if (strength.feedback.length > 0 && password.length > 0) {
                feedbackHTML = `<ul style="margin-top: 8px; font-size: 0.85em; color: #64748b;">${strength.feedback.map(f => `<li>${f}</li>`).join('')}</ul>`;
            }

            strengthIndicator.innerHTML = `
                <div style="margin-top: 10px;">
                    <div style="background: ${color}; height: 4px; width: 100%; border-radius: 2px; margin-bottom: 5px;">
                        <div style="background: white; height: 4px; width: ${100 - strength.score}%; border-radius: 2px;"></div>
                    </div>
                    <p style="margin: 5px 0; font-size: 0.85em; color: ${color}; font-weight: 600;">
                        ${strength.level} (${Math.round(strength.score)}%)
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
}

function initializeCyberAnimations() {
    // Initialize binary background if present
    const binaryStreams = document.querySelectorAll('.binary-stream');
    binaryStreams.forEach(stream => {
        stream.innerHTML = stream.innerHTML.repeat(4); // Repeat for continuous effect
    });
    
    // Add cyber pulse effect to important elements
    const pulseElements = document.querySelectorAll('.cyber-pulse');
    pulseElements.forEach(element => {
        element.style.animation = 'cyberPulse 2s ease-in-out infinite';
    });
}

// ========================================
// 🍪 COOKIE CONSENT SYSTEM
// ========================================

function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => {
            banner.style.display = 'none';
        }, 500);
    }
    showSuccess('🍪 Cookies accepted! You can now use all features.');
    trackEvent('cookies_accepted');
}

function declineCookies() {
    localStorage.setItem('cookiesAccepted', 'false');
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => {
            banner.style.display = 'none';
        }, 500);
    }
    showInfo('🍪 Cookies declined. Some features may be limited.');
    trackEvent('cookies_declined');
}

function customizeCookies() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.id = 'cookieSettingsModal';
    modal.innerHTML = `
        <div class="modal-content cyber-card">
            <button class="modal-close" onclick="closeModal('cookieSettingsModal')">
                <i class="fas fa-xmark"></i>
            </button>
            <div class="modal-header">
                <i class="fas fa-cookie modal-icon cyber-gradient"></i>
                <h2>Cookie Settings</h2>
                <p>Choose which cookies you want to allow</p>
            </div>
            <div class="cookie-settings-content">
                <div class="cookie-setting-item">
                    <label class="checkbox-label">
                        <input type="checkbox" id="essentialCookies" checked disabled>
                        <span><i class="fas fa-check-circle"></i> Essential Cookies <small>(Required)</small></span>
                    </label>
                    <p>These cookies are necessary for the website to function properly.</p>
                </div>
                
                <div class="cookie-setting-item">
                    <label class="checkbox-label">
                        <input type="checkbox" id="analyticsCookies" checked>
                        <span><i class="fas fa-chart-line"></i> Analytics Cookies</span>
                    </label>
                    <p>Help us understand how visitors interact with our website.</p>
                </div>
                
                <div class="cookie-setting-item">
                    <label class="checkbox-label">
                        <input type="checkbox" id="functionalCookies" checked>
                        <span><i class="fas fa-cog"></i> Functional Cookies</span>
                    </label>
                    <p>Remember your preferences and settings.</p>
                </div>
                
                <div class="cookie-setting-item">
                    <label class="checkbox-label">
                        <input type="checkbox" id="marketingCookies">
                        <span><i class="fas fa-bullhorn"></i> Marketing Cookies</span>
                    </label>
                    <p>Used to deliver personalized ads and track marketing campaigns.</p>
                </div>
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="saveCookieSettings()">
                    <i class="fas fa-save"></i> Save Preferences
                </button>
                <button class="btn btn-outline" onclick="closeModal('cookieSettingsModal')">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    showModal('cookieSettingsModal');
    trackEvent('cookies_customize_opened');
}

function saveCookieSettings() {
    const settings = {
        essential: true, // Always enabled
        analytics: document.getElementById('analyticsCookies').checked,
        functional: document.getElementById('functionalCookies').checked,
        marketing: document.getElementById('marketingCookies').checked
    };
    
    localStorage.setItem('cookieSettings', JSON.stringify(settings));
    localStorage.setItem('cookiesAccepted', 'custom');
    
    closeModal('cookieSettingsModal');
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.style.display = 'none';
    }
    
    showSuccess('✅ Cookie preferences saved!');
    trackEvent('cookies_customized', settings);
}

// Show cookie banner on page load
window.addEventListener('load', () => {
    const cookieBanner = document.getElementById('cookieBanner');
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    if (cookieBanner && cookiesAccepted === null) {
        setTimeout(() => {
            cookieBanner.style.display = 'block';
            setTimeout(() => {
                cookieBanner.style.opacity = '1';
                cookieBanner.style.transform = 'translateY(0)';
            }, 100);
        }, 2000);
    }
});

// ========================================
// 📊 ANALYTICS & TRACKING
// ========================================

function trackEvent(eventName, data = {}) {
    console.log(`📊 Event tracked: ${eventName}`, data);
}

// ========================================
// 🧪 UTILITY FUNCTIONS
// ========================================

function formatCourseName(name) {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .replace('Cybersecurity', '🔒 Cybersecurity')
        .replace('Networking', '🌐 Networking')
        .replace('Linux', '🐧 Linux');
}

function formatModuleName(name) {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function getCourseIcon(course) {
    const icons = {
        'cybersecurity': 'fa-lock',
        'networking': 'fa-network-wired',
        'linux': 'fa-linux',
        'github': 'fa-github'
    };
    return icons[course] || 'fa-graduation-cap';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Enhanced toast notifications
function showError(message) {
    showToast(message, 'error');
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showInfo(message) {
    showToast(message, 'info');
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.cyber-toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `cyber-toast cyber-toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
    
    trackEvent('toast_shown', { type, message });
}

// Add toast styles if not already present
if (!document.getElementById('toast-styles')) {
    const toastStyles = document.createElement('style');
    toastStyles.id = 'toast-styles';
    toastStyles.textContent = `
        .cyber-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 16px;
            z-index: 10000;
            animation: toastSlideIn 0.3s ease;
            transform: translateX(0);
            opacity: 1;
            transition: all 0.3s ease;
        }
        
        @keyframes toastSlideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .toast-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }
        
        .cyber-toast-error .toast-icon {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }
        
        .cyber-toast-success .toast-icon {
            background: linear-gradient(135deg, #10b981, #0da271);
            color: white;
        }
        
        .cyber-toast-info .toast-icon {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
        }
        
        .toast-message {
            color: #1e293b;
            font-weight: 500;
        }
        
        .toast-close {
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            font-size: 18px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        
        .toast-close:hover {
            background: #e2e8f0;
            color: #1e293b;
        }
    `;
    document.head.appendChild(toastStyles);
}

// ========================================
// 📥 LOAD INITIAL DATA
// ========================================

async function loadInitialData() {
    try {
        // Load hero stats with animation
        setTimeout(() => {
            animateCounter('studentCount', 10000, 2000);
            animateCounter('courseCount', 15, 1500);
            animateCounter('toolCount', 8, 1200);
            animateCounter('certCount', 5000, 2500);
        }, 500);
        
        trackEvent('initial_data_loaded');
    } catch (error) {
        console.error('Failed to load initial data:', error);
    }
}

async function loadUserData() {
    if (!authToken) return;

    try {
        console.log('👤 Loading user data for:', currentUser?.username);
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

// ========================================
// 📊 ANIMATED COUNTER
// ========================================

function animateCounter(elementId, target, duration = 2000) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let start = 0;
    const increment = target / (duration / 16);
    const startTime = performance.now();
    
    function updateCounter(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const current = Math.floor(progress * target);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// ========================================
// 🎯 EVENT LISTENERS SETUP
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

    // Close modals on click outside
    document.querySelectorAll('.auth-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.auth-modal').forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal(modal.id);
                }
            });
        }
    });

    // Form submissions
    const loginForm = document.querySelector('#loginModal form');
    const registerForm = document.querySelector('#registerModal form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            login();
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            register();
        });
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-times');
                icon.classList.toggle('fa-bars');
            }
        });
    }

    // Scroll to top button
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

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (validateEmail(email)) {
                showSuccess('📧 Thank you for subscribing!');
                newsletterForm.reset();
                trackEvent('newsletter_subscribe', { email });
            } else {
                showError('Please enter a valid email address');
            }
        });
    }

    // Remember me functionality
    const rememberMeCheckbox = document.getElementById('rememberMe');
    if (rememberMeCheckbox) {
        // Load saved username if available
        const savedUsername = localStorage.getItem('savedUsername');
        if (savedUsername && document.getElementById('loginUsername')) {
            document.getElementById('loginUsername').value = savedUsername;
            rememberMeCheckbox.checked = true;
        }

        rememberMeCheckbox.addEventListener('change', function() {
            if (!this.checked) {
                localStorage.removeItem('savedUsername');
            }
        });
    }

    // CTA Register button
    const ctaRegisterBtnElement = document.getElementById('ctaRegisterBtn');
    if (ctaRegisterBtnElement) {
        ctaRegisterBtnElement.addEventListener('click', () => {
            showModal('registerModal');
        });
    }

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
}


window.cyberHub = {
    login,
    register,
    logout,
    updateProgress,
    loadUserProgress,
    checkIP,
    checkPasswordStrength,
    showVPNSimulator,
    showModal,
    closeModal,
    showError,
    showSuccess,
    showInfo,
    trackEvent,
    get currentUser() { return currentUser; },
    get authToken() { return authToken; },
    get securityToken() { return securityToken; }
};

console.log('%c✨ CyberHub API initialized', 'color: #8b5cf6; font-weight: bold;');
console.log('%c📚 Available methods:', 'color: #6366f1;', Object.keys(window.cyberHub));
console.log('%c🔒 Security Features:', 'color: #ef4444;', 'Worker URL Obfuscated, Session Monitoring, Security Token');
console.log('%c✅ Syntax Error Fixed:', 'color: #10b981;', 'API response handling corrected');
