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
const API_TIMEOUT = 10000; 
const RETRY_ATTEMPTS = 3;

let authToken = localStorage.getItem('authToken');
let currentUser = null;
let apiQueue = [];
let isProcessingQueue = false;


document.addEventListener('DOMContentLoaded', () => {
    initializeCyberHub();
});

async function initializeCyberHub() {
    setupPreloader();
    await checkAuthStatus();
    setupEventListeners();
    initializePage();
    setupNavigation();
    initializeCyberAnimations();
    await loadInitialData();
    
    console.log('%c🚀 Cyber Learning Hub initialized successfully!', 'color: #6366f1; font-weight: bold; font-size: 16px;');
    console.log('%c🔒 Backend URL:', 'color: #8b5cf6;', API_BASE);
    console.log('%c👤 User Status:', 'color: #10b981;', authToken ? 'Authenticated' : 'Not Logged In');
}

function setupPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const matrixContainer = document.querySelector('.cyber-matrix');
    if (matrixContainer) {
        const percentageElement = document.querySelector('.loading-percentage');
        let percent = 0;
        const interval = setInterval(() => {
            percent += Math.random() * 5;
            if (percent >= 100) {
                percent = 100;
                clearInterval(interval);
            }
            if (percentageElement) {
                percentageElement.textContent = Math.min(Math.floor(percent), 100) + '%';
            }
            document.querySelector('.loading-fill').style.width = percent + '%';
        }, 100);
    }

    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 2000);
}

// Initialize page components
function initializePage() {
    setupCourseCards();
    setupToolCards();
    setupTestimonialSlider();
    setupCyberEffects();
}


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

    if (username.length < 3) {
        showError('Username must be at least 3 characters');
        return;
    }

    showLoading(true, 'Authenticating...');

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
            if (rememberMe) {
                localStorage.setItem('savedUsername', username);
            } else {
                localStorage.removeItem('savedUsername');
            }

            closeModal('loginModal');
            updateAuthUI(true);
            showSuccess('🎉 Login successful! Welcome back, ' + currentUser.username);
            
            // Reload progress and user data
            await Promise.all([
                loadUserProgress(),
                loadUserData()
            ]);
            
            // Track login event
            trackEvent('user_login', { username: currentUser.username });
        } else {
            showError(response.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        showError('Login failed. Please try again.');
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

    if (username.length < 3) {
        showError('Username must be at least 3 characters');
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
        showError('Password must be at least 8 characters long!');
        return;
    }

    showLoading(true, 'Creating account...');

    try {
        const response = await apiRequest(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.success) {
            showSuccess('✅ Registration successful! Please login to continue.');
            closeModal('registerModal');
            
            // Auto-fill login form
            if (document.getElementById('loginUsername')) {
                document.getElementById('loginUsername').value = username;
                document.getElementById('loginPassword').value = password;
                showModal('loginModal');
            }
            
            // Track registration event
            trackEvent('user_register', { username, email });
        } else {
            showError(response.error || 'Registration failed. Username might already exist.');
        }
    } catch (error) {
        showError('Registration failed. Please try again.');
        console.error('🔐 Registration error:', error);
    } finally {
        showLoading(false);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('savedUsername');
    localStorage.removeItem('savedPassword');
    authToken = null;
    currentUser = null;
    updateAuthUI(false);
    showSuccess('👋 Logged out successfully');
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
        const userInfo = document.querySelector('.user-info');
        if (userInfo) userInfo.classList.add('cyber-glow');
    } else {
        if (userMenu) userMenu.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (userDashboard) userDashboard.style.display = 'none';
        
        const userInfo = document.querySelector('.user-info');
        if (userInfo) userInfo.classList.remove('cyber-glow');
    }
}


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
            body: JSON.stringify({ course, module, completed: true })
        });

        if (response.success) {
            showSuccess(`✅ Progress updated for ${formatCourseName(course)}!`);
            await loadUserProgress();
            trackEvent('progress_update', { course, module });
        } else {
            showError('Failed to update progress');
        }
    } catch (error) {
        showError('Failed to update progress');
        console.error('📊 Progress update error:', error);
    } finally {
        showLoading(false);
    }
}

// ========================================
// CYBER TOOLS SYSTEM
// ========================================

async function checkIP() {
    const button = event?.currentTarget;
    if (button) button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

    try {
        const response = await apiRequest(`${API_BASE}/api/tools/ip`);
        
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
            const response = await apiRequest(`${API_BASE}/api/tools/password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            
            if (response.success) {
                const data = response.data;
                let color = '#ef4444';
                let icon = 'fa-times-circle';
                
                if (data.score >= 80) {
                    color = '#10b981';
                    icon = 'fa-check-circle';
                } else if (data.score >= 60) {
                    color = '#f59e0b';
                    icon = 'fa-exclamation-triangle';
                } else if (data.score >= 40) {
                    color = '#fbbf24';
                    icon = 'fa-exclamation-triangle';
                }

                let feedbackHTML = '';
                if (data.feedback.length > 0) {
                    feedbackHTML = `
                        <div class="password-feedback">
                            <h5><i class="fas fa-lightbulb"></i> Suggestions:</h5>
                            <ul>
                                ${data.feedback.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                }

                if (resultDiv) {
                    resultDiv.innerHTML = `
                        <div class="password-strength-card">
                            <div class="strength-header">
                                <i class="fas ${icon}" style="color: ${color};"></i>
                                <span class="strength-label" style="color: ${color};">${data.strength}</span>
                                <span class="strength-score">${Math.round(data.score)}%</span>
                            </div>
                            <div class="strength-bar">
                                <div class="strength-fill" style="width: ${data.score}%; background: ${color};"></div>
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
                    
                    trackEvent('tool_password_check', { score: data.score, strength: data.strength });
                }
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
// API REQUEST HANDLER WITH RETRY & QUEUE
// ========================================

async function apiRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data,
            status: response.status
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please try again.');
        }
        throw error;
    }
}

// Queue system for API requests
function queueApiRequest(requestFn) {
    return new Promise((resolve, reject) => {
        apiQueue.push({ requestFn, resolve, reject });
        processQueue();
    });
}

async function processQueue() {
    if (isProcessingQueue || apiQueue.length === 0) return;

    isProcessingQueue = true;

    while (apiQueue.length > 0) {
        const { requestFn, resolve, reject } = apiQueue.shift();
        try {
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        }
    }

    isProcessingQueue = false;
}

// ========================================
// USER DATA & ANALYTICS
// ========================================

async function loadUserData() {
    if (!authToken) return;

    try {
        // You can add more user data endpoints here
        console.log('👤 Loading user data for:', currentUser.username);
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

function trackEvent(eventName, data = {}) {
    // In production, send to analytics service
    console.log(`📊 Event tracked: ${eventName}`, data);
    
    // Example: Send to backend for analytics
    /*
    fetch(`${API_BASE}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: eventName,
            data: data,
            timestamp: new Date().toISOString(),
            userId: currentUser?.username
        })
    }).catch(console.error);
    */
}

// ========================================
// UI UTILITIES & EFFECTS
// ========================================

function showLoading(show, message = 'Loading...') {
    // Create or update loading overlay
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
                    <i class="fas fa-spinner fa-spin fa-3x"></i>
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
            if (content) content.style.opacity = '1';
        }, 10);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const content = modal.querySelector('.modal-content');
        if (content) content.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
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
    // Simple auto-rotate testimonials
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length > 1) {
        let currentIndex = 0;
        
        setInterval(() => {
            testimonials.forEach((testimonial, index) => {
                if (index === currentIndex) {
                    testimonial.style.opacity = '1';
                    testimonial.style.transform = 'translateY(0)';
                } else {
                    testimonial.style.opacity = '0.3';
                    testimonial.style.transform = 'translateY(20px)';
                }
            });
            
            currentIndex = (currentIndex + 1) % testimonials.length;
        }, 5000);
    }
}

function setupCyberEffects() {
    // Add cyber pulse effect to important elements
    const pulseElements = document.querySelectorAll('.cyber-pulse');
    pulseElements.forEach(element => {
        element.style.animation = 'cyberPulse 2s ease-in-out infinite';
    });
    
    // Add styles for cyber pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cyberPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
            50% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
        }
        
        @keyframes cyberGlow {
            0%, 100% { text-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
            50% { text-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 30px rgba(139, 92, 246, 0.8); }
        }
        
        .cyber-glow {
            animation: cyberGlow 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);
}

function initializeCyberAnimations() {
    // Initialize binary background if present
    const binaryStreams = document.querySelectorAll('.binary-stream');
    binaryStreams.forEach(stream => {
        stream.innerHTML = stream.innerHTML.repeat(4); // Repeat for continuous effect
    });
}

// ========================================
// EVENT LISTENERS SETUP
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

    // Cookie banner
    window.addEventListener('load', () => {
        const cookieBanner = document.getElementById('cookieBanner');
        if (cookieBanner && localStorage.getItem('cookiesAccepted') === null) {
            setTimeout(() => {
                cookieBanner.style.display = 'block';
                cookieBanner.style.opacity = '1';
            }, 2000);
        }
    });
}

// ========================================
// UTILITY FUNCTIONS
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
}

// Add toast styles
const toastStyles = document.createElement('style');
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

// ========================================
// LOAD INITIAL DATA
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
        
        // Load any other initial data here
    } catch (error) {
        console.error('Failed to load initial data:', error);
    }
}

// ========================================
// ANIMATED COUNTER
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
    currentUser,
    authToken
};

console.log('%c✨ CyberHub API initialized', 'color: #8b5cf6; font-weight: bold;');
console.log('%c📚 Available methods:', 'color: #6366f1;', Object.keys(window.cyberHub));
