// ===== SMART ATTENDANCE SYSTEM - MAIN APPLICATION =====
// AI-Powered Attendance Management System
// This is a frontend prototype with simulated AI features

class SmartAttendanceSystem {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.fakeData = null;
        this.currentPage = 'dashboard';
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // Initialize the application
        this.init();
    }

    // ===== INITIALIZATION =====
    async init() {
        try {
            // Show loading screen
            this.showLoading();
            
            // Load fake data
            await this.loadFakeData();
            
            // Initialize theme
            this.initTheme();
            
            // Check for existing session
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                this.currentRole = this.currentUser.role;
                this.showDashboard();
            } else {
                this.showLogin();
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Hide loading screen
            this.hideLoading();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showToast('Failed to load application', 'error');
        }
    }

    // ===== DATA MANAGEMENT =====
    async loadFakeData() {
        try {
            const response = await fetch('data/fakeData.json');
            this.fakeData = await response.json();
            
            // Merge with localStorage data if exists
            const localData = localStorage.getItem('attendanceData');
            if (localData) {
                const parsedLocalData = JSON.parse(localData);
                this.fakeData = { ...this.fakeData, ...parsedLocalData };
            }
            
            console.log('Fake data loaded successfully');
        } catch (error) {
            console.error('Failed to load fake data:', error);
            // Fallback to minimal data structure
            this.fakeData = {
                users: [],
                classes: [],
                attendanceRecords: [],
                leaveApplications: [],
                leaderboard: [],
                storeItems: []
            };
        }
    }

    saveToLocalStorage() {
        const dataToSave = {
            attendanceRecords: this.fakeData.attendanceRecords,
            leaveApplications: this.fakeData.leaveApplications,
            coinHistory: this.fakeData.coinHistory,
            users: this.fakeData.users // Save updated user data including coins
        };
        localStorage.setItem('attendanceData', JSON.stringify(dataToSave));
    }

    resetDemoData() {
        localStorage.removeItem('attendanceData');
        localStorage.removeItem('currentUser');
        this.loadFakeData().then(() => {
            this.showToast('Demo data reset successfully', 'success');
            this.logout();
        });
    }

    // ===== THEME MANAGEMENT =====
    initTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', this.isDarkMode);
        
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    // ===== UI UTILITIES =====
    showLoading() {
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    }

    showLogin() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-dashboard').style.display = 'none';
        this.populateUserDropdown();
    }

    showDashboard() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-dashboard').style.display = 'flex';
        this.updateUserInfo();
        this.setupNavigation();
        this.navigateToPage('dashboard');
    }

    showToast(message, type = 'info', title = '') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="toast-icon ${iconMap[type]}"></i>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
        `;

        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    showModal(title, content, actions = []) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        const actionsHTML = actions.map(action => 
            `<button class="btn ${action.class || 'btn-secondary'}" onclick="${action.onclick}">${action.text}</button>`
        ).join('');

        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">${title}</h2>
                <button class="modal-close" onclick="app.closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${actions.length ? `<div class="modal-footer">${actionsHTML}</div>` : ''}
        `;

        const container = document.getElementById('modal-container');
        container.innerHTML = '';
        container.appendChild(modal);
        container.classList.add('active');
    }

    closeModal() {
        const container = document.getElementById('modal-container');
        container.classList.remove('active');
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    }

    // ===== AUTHENTICATION =====
    populateUserDropdown() {
        const roleButtons = document.querySelectorAll('.role-btn');
        const userSelector = document.querySelector('.user-selector');
        const userSelect = document.getElementById('user-select');
        const loginBtn = document.getElementById('login-btn');

        roleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                roleButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                const selectedRole = btn.dataset.role;
                
                // Filter users by role
                const users = this.fakeData.users.filter(user => user.role === selectedRole);
                
                // Populate dropdown
                userSelect.innerHTML = '<option value="">Select a user...</option>';
                users.forEach(user => {
                    userSelect.innerHTML += `<option value="${user.id}">${user.name}</option>`;
                });
                
                userSelector.style.display = 'block';
                this.checkLoginButton();
            });
        });

        userSelect.addEventListener('change', () => {
            this.checkLoginButton();
        });

        loginBtn.addEventListener('click', () => {
            this.handleLogin();
        });
    }

    checkLoginButton() {
        const roleSelected = document.querySelector('.role-btn.active');
        const userSelected = document.getElementById('user-select').value;
        const loginBtn = document.getElementById('login-btn');
        
        loginBtn.disabled = !(roleSelected && userSelected);
    }

    handleLogin() {
        const selectedUserId = document.getElementById('user-select').value;
        const selectedUser = this.fakeData.users.find(user => user.id === selectedUserId);
        
        if (selectedUser) {
            this.currentUser = selectedUser;
            this.currentRole = selectedUser.role;
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(selectedUser));
            
            this.showToast(`Welcome back, ${selectedUser.name}!`, 'success');
            this.showDashboard();
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.currentRole = null;
        this.showLogin();
    }

    // ===== NAVIGATION =====
    setupNavigation() {
        const navMenus = {
            faculty: [
                { href: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { href: 'classes', icon: 'fas fa-chalkboard', text: 'My Classes' },
                { href: 'attendance', icon: 'fas fa-calendar-check', text: 'Attendance' },
                { href: 'leave-management', icon: 'fas fa-file-alt', text: 'Leave Management' },
                { href: 'reports', icon: 'fas fa-chart-bar', text: 'Reports' },
                { href: 'profile', icon: 'fas fa-user', text: 'Profile' }
            ],
            student: [
                { href: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { href: 'attendance', icon: 'fas fa-calendar-check', text: 'My Attendance' },
                { href: 'leaderboard', icon: 'fas fa-trophy', text: 'Leaderboard' },
                { href: 'store', icon: 'fas fa-store', text: 'Coin Store' },
                { href: 'leave-application', icon: 'fas fa-file-alt', text: 'Leave Application' },
                { href: 'chatbot', icon: 'fas fa-robot', text: 'AI Assistant' },
                { href: 'profile', icon: 'fas fa-user', text: 'Profile' }
            ],
            parent: [
                { href: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { href: 'child-attendance', icon: 'fas fa-calendar-check', text: 'Child Attendance' },
                { href: 'timetable', icon: 'fas fa-clock', text: 'Timetable' },
                { href: 'notifications', icon: 'fas fa-bell', text: 'Notifications' },
                { href: 'profile', icon: 'fas fa-user', text: 'Profile' }
            ]
        };

        const navMenu = document.getElementById('nav-menu');
        const menuItems = navMenus[this.currentRole] || [];
        
        navMenu.innerHTML = menuItems.map(item => `
            <li>
                <a href="#${item.href}" data-page="${item.href}">
                    <i class="${item.icon}"></i>
                    <span>${item.text}</span>
                </a>
            </li>
        `).join('');

        // Add click listeners
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page);
            });
        });
    }

    navigateToPage(page) {
        this.currentPage = page;
        
        // Update active nav item
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
        
        // Update page title
        const pageTitle = document.getElementById('page-title');
        pageTitle.textContent = this.getPageTitle(page);
        
        // Load page content
        this.loadPageContent(page);
    }

    getPageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            classes: 'My Classes',
            attendance: this.currentRole === 'faculty' ? 'Attendance Management' : 'My Attendance',
            'leave-management': 'Leave Management',
            'leave-application': 'Leave Application',
            reports: 'Reports',
            leaderboard: 'Leaderboard',
            store: 'Coin Store',
            'child-attendance': 'Child Attendance',
            timetable: 'Timetable',
            notifications: 'Notifications',
            chatbot: 'AI Assistant',
            profile: 'Profile'
        };
        return titles[page] || 'Dashboard';
    }

    // ===== PAGE CONTENT LOADING =====
    loadPageContent(page) {
        const contentArea = document.getElementById('content-area');
        
        switch (page) {
            case 'dashboard':
                this.loadDashboard(contentArea);
                break;
            case 'classes':
                this.loadClassesPage(contentArea);
                break;
            case 'attendance':
                if (this.currentRole === 'faculty') {
                    this.loadFacultyAttendancePage(contentArea);
                } else {
                    this.loadStudentAttendancePage(contentArea);
                }
                break;
            case 'leave-management':
                this.loadLeaveManagementPage(contentArea);
                break;
            case 'leave-application':
                this.loadLeaveApplicationPage(contentArea);
                break;
            case 'reports':
                this.loadReportsPage(contentArea);
                break;
            case 'leaderboard':
                this.loadLeaderboardPage(contentArea);
                break;
            case 'store':
                this.loadStorePage(contentArea);
                break;
            case 'child-attendance':
                this.loadChildAttendancePage(contentArea);
                break;
            case 'timetable':
                this.loadTimetablePage(contentArea);
                break;
            case 'notifications':
                this.loadNotificationsPage(contentArea);
                break;
            case 'chatbot':
                this.loadChatbotPage(contentArea);
                break;
            case 'profile':
                this.loadProfilePage(contentArea);
                break;
            default:
                this.loadDashboard(contentArea);
        }
    }

    // ===== DASHBOARD IMPLEMENTATIONS =====
    loadDashboard(container) {
        if (this.currentRole === 'faculty') {
            this.loadFacultyDashboard(container);
        } else if (this.currentRole === 'student') {
            this.loadStudentDashboard(container);
        } else if (this.currentRole === 'parent') {
            this.loadParentDashboard(container);
        }
    }

    loadFacultyDashboard(container) {
        const userClasses = this.fakeData.classes.filter(cls => cls.facultyId === this.currentUser.id);
        const totalStudents = userClasses.reduce((sum, cls) => sum + cls.totalStudents, 0);
        const todayAttendance = this.fakeData.attendanceRecords.filter(record => 
            record.date === new Date().toISOString().split('T')[0]
        ).length;
        const pendingLeaves = this.fakeData.leaveApplications.filter(leave => 
            leave.status === 'pending'
        ).length;

        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chalkboard"></i>
                        </div>
                        <div class="stat-number">${userClasses.length}</div>
                        <div class="stat-label">My Classes</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-number">${totalStudents}</div>
                        <div class="stat-label">Total Students</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-number">${todayAttendance}</div>
                        <div class="stat-label">Today's Sessions</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="stat-number">${pendingLeaves}</div>
                        <div class="stat-label">Pending Leaves</div>
                    </div>
                </div>

                <div class="grid grid-cols-2">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Quick Actions</h3>
                        </div>
                        <div class="card-content">
                            <div style="display: grid; gap: var(--space-md);">
                                <button class="btn btn-primary" onclick="app.navigateToPage('classes')">
                                    <i class="fas fa-camera"></i>
                                    Take Attendance
                                </button>
                                <button class="btn btn-secondary" onclick="app.navigateToPage('leave-management')">
                                    <i class="fas fa-file-alt"></i>
                                    Review Leave Applications
                                </button>
                                <button class="btn btn-secondary" onclick="app.navigateToPage('reports')">
                                    <i class="fas fa-download"></i>
                                    Export Reports
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Recent Activity</h3>
                        </div>
                        <div class="card-content">
                            <div style="space-y: var(--space-md);">
                                <div style="padding: var(--space-md); background: var(--neutral-50); border-radius: var(--radius-md); margin-bottom: var(--space-sm);">
                                    <p style="font-weight: 500; margin-bottom: var(--space-xs);">CS 101 - Attendance Taken</p>
                                    <p style="font-size: var(--font-size-sm); color: var(--neutral-600);">Today at 9:30 AM</p>
                                </div>
                                <div style="padding: var(--space-md); background: var(--neutral-50); border-radius: var(--radius-md); margin-bottom: var(--space-sm);">
                                    <p style="font-weight: 500; margin-bottom: var(--space-xs);">New Leave Application</p>
                                    <p style="font-size: var(--font-size-sm); color: var(--neutral-600);">Alex Thompson - Yesterday</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Demo Controls</h3>
                    </div>
                    <div class="card-content">
                        <button class="btn btn-warning" onclick="app.resetDemoData()">
                            <i class="fas fa-refresh"></i>
                            Reset Demo Data
                        </button>
                        <p style="font-size: var(--font-size-sm); color: var(--neutral-600); margin-top: var(--space-sm);">
                            This will reset all attendance records, leave applications, and coin balances to default values.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    loadStudentDashboard(container) {
        const studentAttendance = this.calculateStudentAttendance(this.currentUser.id);
        const studentUser = this.fakeData.users.find(u => u.id === this.currentUser.id);
        const coins = studentUser ? studentUser.coins : 0;

        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <div class="stat-number">${studentAttendance.percentage}%</div>
                        <div class="stat-label">Attendance Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-number">${studentAttendance.present}</div>
                        <div class="stat-label">Classes Attended</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-times"></i>
                        </div>
                        <div class="stat-number">${studentAttendance.absent}</div>
                        <div class="stat-label">Classes Missed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="stat-number">${coins}</div>
                        <div class="stat-label">Coins Earned</div>
                    </div>
                </div>

                <div class="grid grid-cols-2">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Attendance Overview</h3>
                        </div>
                        <div class="card-content">
                            <canvas id="attendance-chart" class="chart-container"></canvas>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Recent Achievements</h3>
                        </div>
                        <div class="card-content">
                            <div style="display: grid; gap: var(--space-md);">
                                <div class="badge badge-success">
                                    <i class="fas fa-star"></i>
                                    Perfect Week
                                </div>
                                <div class="badge badge-info">
                                    <i class="fas fa-clock"></i>
                                    Early Bird
                                </div>
                                <button class="btn btn-primary" onclick="app.navigateToPage('store')">
                                    <i class="fas fa-store"></i>
                                    Visit Coin Store
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create attendance chart
        setTimeout(() => {
            this.createAttendanceChart('attendance-chart', studentAttendance);
        }, 100);
    }

    loadParentDashboard(container) {
        const children = this.fakeData.users.filter(user => 
            this.currentUser.children && this.currentUser.children.includes(user.id)
        );

        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-child"></i>
                        </div>
                        <div class="stat-number">${children.length}</div>
                        <div class="stat-label">Children</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-number">92%</div>
                        <div class="stat-label">Avg Attendance</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-bell"></i>
                        </div>
                        <div class="stat-number">3</div>
                        <div class="stat-label">Notifications</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="stat-number">1</div>
                        <div class="stat-label">Pending Leaves</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Children Overview</h3>
                    </div>
                    <div class="card-content">
                        <div class="grid grid-cols-1" style="gap: var(--space-lg);">
                            ${children.map(child => {
                                const attendance = this.calculateStudentAttendance(child.id);
                                return `
                                    <div class="student-card">
                                        <div class="student-header">
                                            <img src="${child.profilePic}" alt="${child.name}" class="avatar">
                                            <div class="student-info">
                                                <h3>${child.name}</h3>
                                                <p>Roll: ${child.roll} | ${child.department}</p>
                                            </div>
                                            <div class="attendance-status ${attendance.percentage >= 75 ? 'present' : 'absent'}">
                                                ${attendance.percentage}% Attendance
                                            </div>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${attendance.percentage}%;"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== ATTENDANCE MANAGEMENT =====
    loadFacultyAttendancePage(container) {
        const userClasses = this.fakeData.classes.filter(cls => cls.facultyId === this.currentUser.id);
        
        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Take Attendance</h3>
                    </div>
                    <div class="card-content">
                        <div class="grid grid-cols-1" style="gap: var(--space-lg);">
                            ${userClasses.map(cls => {
                                const students = this.fakeData.users.filter(user => user.classId === cls.id);
                                return `
                                    <div class="class-card">
                                        <div class="class-header">
                                            <div class="class-info">
                                                <h3>${cls.name} (${cls.code})</h3>
                                                <p>${students.length} students | Room: ${cls.room}</p>
                                            </div>
                                        </div>
                                        <div class="action-buttons">
                                            <button class="action-btn" onclick="app.takeAttendance('${cls.id}', 'ai')">
                                                <i class="fas fa-camera"></i>
                                                AI Attendance
                                            </button>
                                            <button class="action-btn" onclick="app.takeAttendance('${cls.id}', 'manual')">
                                                <i class="fas fa-edit"></i>
                                                Manual Attendance
                                            </button>
                                            <button class="action-btn" onclick="app.viewAttendanceHistory('${cls.id}')">
                                                <i class="fas fa-history"></i>
                                                View History
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    takeAttendance(classId, method) {
        const classInfo = this.fakeData.classes.find(cls => cls.id === classId);
        const students = this.fakeData.users.filter(user => user.classId === classId);
        
        if (method === 'ai') {
            this.showAIAttendanceModal(classInfo, students);
        } else {
            this.showManualAttendanceModal(classInfo, students);
        }
    }

    showAIAttendanceModal(classInfo, students) {
        const modalContent = `
            <div style="text-align: center; padding: var(--space-lg);">
                <h3 style="margin-bottom: var(--space-lg);">AI Attendance for ${classInfo.name}</h3>
                
                <div id="camera-section" style="margin-bottom: var(--space-lg);">
                    <div style="border: 2px dashed var(--neutral-300); border-radius: var(--radius-lg); padding: var(--space-2xl); background: var(--neutral-50);">
                        <i class="fas fa-camera" style="font-size: 3rem; color: var(--neutral-400); margin-bottom: var(--space-md);"></i>
                        <p style="margin-bottom: var(--space-lg);">Upload a classroom photo or take a picture</p>
                        <input type="file" id="photo-upload" accept="image/*" style="margin-bottom: var(--space-md);">
                        <br>
                        <button class="btn btn-primary" onclick="app.simulateAIProcessing('${classInfo.id}')">
                            <i class="fas fa-robot"></i>
                            Process with AI
                        </button>
                    </div>
                </div>
                
                <div id="ai-results" style="display: none;">
                    <h4 style="margin-bottom: var(--space-md);">AI Detection Results</h4>
                    <div id="detected-faces" style="margin-bottom: var(--space-lg);"></div>
                    <button class="btn btn-success" onclick="app.saveAIAttendance('${classInfo.id}')">
                        <i class="fas fa-save"></i>
                        Save Attendance
                    </button>
                </div>
            </div>
        `;

        this.showModal('AI Attendance', modalContent);
    }

    simulateAIProcessing(classId) {
        const students = this.fakeData.users.filter(user => user.classId === classId);
        
        // Show loading
        document.getElementById('ai-results').style.display = 'block';
        document.getElementById('detected-faces').innerHTML = `
            <div style="text-align: center; padding: var(--space-lg);">
                <div class="loading-spinner" style="margin: 0 auto var(--space-md);"></div>
                <p>AI is processing the image...</p>
            </div>
        `;

        // Simulate AI processing
        setTimeout(() => {
            // Randomly mark some students as detected
            const detectedStudents = students.filter(() => Math.random() > 0.3);
            
            document.getElementById('detected-faces').innerHTML = `
                <div style="text-align: left;">
                    <h5 style="margin-bottom: var(--space-md);">Detected Students:</h5>
                    ${detectedStudents.map(student => `
                        <div style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-sm); background: var(--accent-success); color: white; border-radius: var(--radius-md); margin-bottom: var(--space-sm);">
                            <img src="${student.profilePic}" class="avatar avatar-sm">
                            <span>${student.name} (${student.roll})</span>
                            <i class="fas fa-check-circle"></i>
                        </div>
                    `).join('')}
                    
                    <h5 style="margin: var(--space-lg) 0 var(--space-md) 0;">Not Detected:</h5>
                    ${students.filter(s => !detectedStudents.includes(s)).map(student => `
                        <div style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-sm); background: var(--accent-error); color: white; border-radius: var(--radius-md); margin-bottom: var(--space-sm);">
                            <img src="${student.profilePic}" class="avatar avatar-sm">
                            <span>${student.name} (${student.roll})</span>
                            <i class="fas fa-times-circle"></i>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Store temporary attendance data
            this.tempAttendance = {
                classId: classId,
                present: detectedStudents.map(s => s.id),
                absent: students.filter(s => !detectedStudents.includes(s)).map(s => s.id),
                method: 'ai'
            };
        }, 2000);
    }

    saveAIAttendance(classId) {
        if (this.tempAttendance) {
            this.saveAttendanceRecord(this.tempAttendance);
            this.closeModal();
            this.showToast('AI attendance saved successfully!', 'success');
        }
    }

    showManualAttendanceModal(classInfo, students) {
        const modalContent = `
            <div style="padding: var(--space-lg);">
                <h3 style="margin-bottom: var(--space-lg);">Manual Attendance for ${classInfo.name}</h3>
                
                <div id="manual-attendance-list">
                    ${students.map(student => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); border: 1px solid var(--neutral-200); border-radius: var(--radius-md); margin-bottom: var(--space-sm);">
                            <div style="display: flex; align-items: center; gap: var(--space-md);">
                                <img src="${student.profilePic}" class="avatar avatar-sm">
                                <div>
                                    <strong>${student.name}</strong>
                                    <p style="font-size: var(--font-size-sm); color: var(--neutral-600);">${student.roll}</p>
                                </div>
                            </div>
                            <div style="display: flex; gap: var(--space-sm);">
                                <label style="display: flex; align-items: center; gap: var(--space-xs);">
                                    <input type="radio" name="attendance-${student.id}" value="present" checked>
                                    <span class="badge badge-success">Present</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: var(--space-xs);">
                                    <input type="radio" name="attendance-${student.id}" value="absent">
                                    <span class="badge badge-error">Absent</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: var(--space-xs);">
                                    <input type="radio" name="attendance-${student.id}" value="late">
                                    <span class="badge badge-warning">Late</span>
                                </label>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: var(--space-lg); text-align: center;">
                    <button class="btn btn-success" onclick="app.saveManualAttendance('${classInfo.id}')">
                        <i class="fas fa-save"></i>
                        Save Attendance
                    </button>
                </div>
            </div>
        `;

        this.showModal('Manual Attendance', modalContent);
    }

    saveManualAttendance(classId) {
        const students = this.fakeData.users.filter(user => user.classId === classId);
        const presentStudents = [];
        const absentStudents = [];
        const lateStudents = [];

        students.forEach(student => {
            const selected = document.querySelector(`input[name="attendance-${student.id}"]:checked`);
            if (selected) {
                const status = selected.value;
                if (status === 'present') {
                    presentStudents.push(student.id);
                } else if (status === 'absent') {
                    absentStudents.push(student.id);
                } else if (status === 'late') {
                    lateStudents.push(student.id);
                }
            }
        });

        const attendanceData = {
            classId: classId,
            present: presentStudents,
            absent: absentStudents,
            late: lateStudents,
            method: 'manual'
        };

        this.saveAttendanceRecord(attendanceData);
        this.closeModal();
        this.showToast('Manual attendance saved successfully!', 'success');
    }

    saveAttendanceRecord(attendanceData) {
        const record = {
            id: 'att' + Date.now(),
            classId: attendanceData.classId,
            date: new Date().toISOString().split('T')[0],
            presentStudentIds: attendanceData.present,
            absentStudentIds: attendanceData.absent,
            lateStudentIds: attendanceData.late || [],
            savedBy: this.currentUser.id,
            timestamp: new Date().toISOString(),
            method: attendanceData.method
        };

        this.fakeData.attendanceRecords.push(record);
        
        // Award coins to present students
        attendanceData.present.forEach(studentId => {
            this.awardCoins(studentId, 5, 'attendance', attendanceData.classId);
        });

        this.saveToLocalStorage();
    }

    awardCoins(studentId, amount, source, classId = null) {
        const student = this.fakeData.users.find(u => u.id === studentId);
        if (student) {
            student.coins = (student.coins || 0) + amount;
            
            // Add to coin history
            if (!this.fakeData.coinHistory) this.fakeData.coinHistory = [];
            
            let studentHistory = this.fakeData.coinHistory.find(h => h.studentId === studentId);
            if (!studentHistory) {
                studentHistory = { studentId: studentId, transactions: [] };
                this.fakeData.coinHistory.push(studentHistory);
            }
            
            studentHistory.transactions.push({
                date: new Date().toISOString().split('T')[0],
                amount: amount,
                source: source,
                classId: classId,
                description: `Earned ${amount} coins for ${source}`
            });
        }
    }

    // ===== STUDENT ATTENDANCE PAGE =====
    loadStudentAttendancePage(container) {
        const attendance = this.calculateStudentAttendance(this.currentUser.id);
        const studentClass = this.fakeData.classes.find(cls => cls.id === this.currentUser.classId);
        
        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <div class="stat-number">${attendance.percentage}%</div>
                        <div class="stat-label">Overall Attendance</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-number">${attendance.present}</div>
                        <div class="stat-label">Classes Attended</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-times"></i>
                        </div>
                        <div class="stat-number">${attendance.absent}</div>
                        <div class="stat-label">Classes Missed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-number">${attendance.late || 0}</div>
                        <div class="stat-label">Late Arrivals</div>
                    </div>
                </div>

                <div class="grid grid-cols-2">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Attendance Trend</h3>
                        </div>
                        <div class="card-content">
                            <canvas id="student-attendance-chart" class="chart-container"></canvas>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Class Information</h3>
                        </div>
                        <div class="card-content">
                            ${studentClass ? `
                                <h4>${studentClass.name}</h4>
                                <p><strong>Code:</strong> ${studentClass.code}</p>
                                <p><strong>Credits:</strong> ${studentClass.credits}</p>
                                <p><strong>Room:</strong> ${studentClass.room}</p>
                                <p><strong>Faculty:</strong> ${this.fakeData.users.find(u => u.id === studentClass.facultyId)?.name}</p>
                            ` : 'No class information available'}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Attendance History</h3>
                    </div>
                    <div class="card-content">
                        ${this.generateAttendanceHistory()}
                    </div>
                </div>
            </div>
        `;

        // Create chart
        setTimeout(() => {
            this.createStudentAttendanceChart('student-attendance-chart');
        }, 100);
    }

    calculateStudentAttendance(studentId) {
        const studentRecords = this.fakeData.attendanceRecords.filter(record => 
            record.presentStudentIds.includes(studentId) || 
            record.absentStudentIds.includes(studentId) ||
            (record.lateStudentIds && record.lateStudentIds.includes(studentId))
        );

        const present = studentRecords.filter(record => record.presentStudentIds.includes(studentId)).length;
        const late = studentRecords.filter(record => record.lateStudentIds && record.lateStudentIds.includes(studentId)).length;
        const absent = studentRecords.filter(record => record.absentStudentIds.includes(studentId)).length;
        const total = present + late + absent;

        return {
            present: present + late, // Count late as present for percentage
            absent,
            late,
            total,
            percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0
        };
    }

    generateAttendanceHistory() {
        const studentRecords = this.fakeData.attendanceRecords.filter(record => 
            record.presentStudentIds.includes(this.currentUser.id) || 
            record.absentStudentIds.includes(this.currentUser.id) ||
            (record.lateStudentIds && record.lateStudentIds.includes(this.currentUser.id))
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (studentRecords.length === 0) {
            return '<p>No attendance records found.</p>';
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Class</th>
                            <th>Status</th>
                            <th>Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentRecords.map(record => {
                            const classInfo = this.fakeData.classes.find(cls => cls.id === record.classId);
                            let status = '';
                            if (record.presentStudentIds.includes(this.currentUser.id)) {
                                status = '<span class="attendance-status present"><i class="fas fa-check"></i> Present</span>';
                            } else if (record.lateStudentIds && record.lateStudentIds.includes(this.currentUser.id)) {
                                status = '<span class="attendance-status late"><i class="fas fa-clock"></i> Late</span>';
                            } else {
                                status = '<span class="attendance-status absent"><i class="fas fa-times"></i> Absent</span>';
                            }
                            
                            return `
                                <tr>
                                    <td>${new Date(record.date).toLocaleDateString()}</td>
                                    <td>${classInfo ? classInfo.name : 'Unknown Class'}</td>
                                    <td>${status}</td>
                                    <td><span class="badge badge-info">${record.method}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // ===== LEADERBOARD PAGE =====
    loadLeaderboardPage(container) {
        const leaderboard = this.fakeData.leaderboard.sort((a, b) => b.coins - a.coins);
        const currentStudentRank = leaderboard.findIndex(student => student.studentId === this.currentUser.id) + 1;

        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Department Leaderboard</h3>
                        <div style="display: flex; gap: var(--space-sm);">
                            <button class="btn btn-sm btn-primary" id="dept-leaderboard">Department</button>
                            <button class="btn btn-sm btn-secondary" id="college-leaderboard">College</button>
                        </div>
                    </div>
                    <div class="card-content">
                        ${currentStudentRank > 0 ? `
                            <div style="background: var(--gradient-primary); color: white; padding: var(--space-lg); border-radius: var(--radius-md); margin-bottom: var(--space-lg); text-align: center;">
                                <h4>Your Rank: #${currentStudentRank}</h4>
                                <p>Keep up the great work!</p>
                            </div>
                        ` : ''}
                        
                        <div class="leaderboard-list">
                            ${leaderboard.map((student, index) => `
                                <div class="student-card ${student.studentId === this.currentUser.id ? 'current-user' : ''}" style="${student.studentId === this.currentUser.id ? 'border: 2px solid var(--primary-500); box-shadow: var(--shadow-glow);' : ''}">
                                    <div class="student-header">
                                        <div style="display: flex; align-items: center; gap: var(--space-md);">
                                            <div style="font-size: var(--font-size-xl); font-weight: 700; color: var(--primary-600); min-width: 30px;">
                                                #${index + 1}
                                            </div>
                                            <img src="assets/student${(index % 8) + 1}.jpg" class="avatar">
                                            <div class="student-info">
                                                <h3>${student.name}</h3>
                                                <p>${student.department}</p>
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: var(--font-size-lg); font-weight: 600; color: var(--primary-600);">
                                                <i class="fas fa-coins"></i> ${student.coins}
                                            </div>
                                            <div style="font-size: var(--font-size-sm); color: var(--neutral-600);">
                                                ${student.attendanceRate}% attendance
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: var(--space-xs); margin-top: var(--space-sm);">
                                        ${student.achievements.map(achievement => `
                                            <span class="badge badge-success">${achievement}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== COIN STORE PAGE =====
    loadStorePage(container) {
        const currentUser = this.fakeData.users.find(u => u.id === this.currentUser.id);
        const coins = currentUser ? currentUser.coins : 0;

        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Coin Store</h3>
                        <div style="display: flex; align-items: center; gap: var(--space-md);">
                            <span style="font-size: var(--font-size-lg); font-weight: 600; color: var(--primary-600);">
                                <i class="fas fa-coins"></i> ${coins} Coins
                            </span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="grid grid-cols-3">
                            ${this.fakeData.storeItems.map(item => `
                                <div class="card" style="text-align: center;">
                                    <div style="font-size: 3rem; margin-bottom: var(--space-md); ${item.color ? `color: ${item.color}` : ''};">
                                        ${item.icon ? `<i class="${item.icon}"></i>` : '🎨'}
                                    </div>
                                    <h4 style="margin-bottom: var(--space-sm);">${item.name}</h4>
                                    <p style="font-size: var(--font-size-sm); color: var(--neutral-600); margin-bottom: var(--space-md);">
                                        ${item.description}
                                    </p>
                                    <div style="margin-bottom: var(--space-md);">
                                        <span style="font-size: var(--font-size-lg); font-weight: 600; color: var(--primary-600);">
                                            <i class="fas fa-coins"></i> ${item.price}
                                        </span>
                                    </div>
                                    <button class="btn ${coins >= item.price ? 'btn-primary' : 'btn-secondary'}" 
                                            ${coins >= item.price ? `onclick="app.purchaseItem('${item.id}')"` : 'disabled'}>
                                        ${coins >= item.price ? 'Purchase' : 'Insufficient Coins'}
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Coin History</h3>
                    </div>
                    <div class="card-content">
                        ${this.generateCoinHistory()}
                    </div>
                </div>
            </div>
        `;
    }

    purchaseItem(itemId) {
        const item = this.fakeData.storeItems.find(i => i.id === itemId);
        const currentUser = this.fakeData.users.find(u => u.id === this.currentUser.id);
        
        if (item && currentUser && currentUser.coins >= item.price) {
            currentUser.coins -= item.price;
            
            // Add to coin history
            this.addCoinTransaction(this.currentUser.id, -item.price, 'purchase', null, `Purchased ${item.name}`);
            
            this.saveToLocalStorage();
            this.showToast(`Successfully purchased ${item.name}!`, 'success');
            this.loadStorePage(document.getElementById('content-area'));
        }
    }

    addCoinTransaction(studentId, amount, source, classId, description) {
        if (!this.fakeData.coinHistory) this.fakeData.coinHistory = [];
        
        let studentHistory = this.fakeData.coinHistory.find(h => h.studentId === studentId);
        if (!studentHistory) {
            studentHistory = { studentId: studentId, transactions: [] };
            this.fakeData.coinHistory.push(studentHistory);
        }
        
        studentHistory.transactions.push({
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            source: source,
            classId: classId,
            description: description
        });
    }

    generateCoinHistory() {
        const studentHistory = this.fakeData.coinHistory?.find(h => h.studentId === this.currentUser.id);
        
        if (!studentHistory || !studentHistory.transactions.length) {
            return '<p>No coin transactions yet.</p>';
        }

        const sortedTransactions = studentHistory.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedTransactions.map(transaction => `
                            <tr>
                                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                                <td>${transaction.description}</td>
                                <td style="color: ${transaction.amount > 0 ? 'var(--accent-success)' : 'var(--accent-error)'};">
                                    ${transaction.amount > 0 ? '+' : ''}${transaction.amount}
                                </td>
                                <td>
                                    <span class="badge ${transaction.amount > 0 ? 'badge-success' : 'badge-warning'}">
                                        ${transaction.source}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // ===== LEAVE APPLICATION PAGE =====
    loadLeaveApplicationPage(container) {
        const studentLeaves = this.fakeData.leaveApplications.filter(leave => leave.studentId === this.currentUser.id);

        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Submit Leave Application</h3>
                    </div>
                    <div class="card-content">
                        <form id="leave-application-form">
                            <div class="form-group">
                                <label class="form-label">Student Name</label>
                                <input type="text" class="form-input" value="${this.currentUser.name}" readonly>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Class</label>
                                <select class="form-select" id="leave-class" required>
                                    <option value="">Select Class</option>
                                    ${this.fakeData.classes.filter(cls => cls.id === this.currentUser.classId).map(cls => `
                                        <option value="${cls.id}">${cls.name} (${cls.code})</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Reason</label>
                                <select class="form-select" id="leave-reason" required>
                                    <option value="">Select Reason</option>
                                    <option value="Medical Appointment">Medical Appointment</option>
                                    <option value="Family Emergency">Family Emergency</option>
                                    <option value="Academic Conference">Academic Conference</option>
                                    <option value="Personal">Personal</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Details</label>
                                <textarea class="form-textarea" id="leave-details" placeholder="Please provide detailed explanation..." required></textarea>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                                <div class="form-group">
                                    <label class="form-label">Start Date</label>
                                    <input type="date" class="form-input" id="leave-start-date" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">End Date</label>
                                    <input type="date" class="form-input" id="leave-end-date" required>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i>
                                Submit Application
                            </button>
                        </form>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">My Leave Applications</h3>
                    </div>
                    <div class="card-content">
                        ${studentLeaves.length > 0 ? `
                            <div class="grid grid-cols-1" style="gap: var(--space-lg);">
                                ${studentLeaves.map(leave => `
                                    <div class="card">
                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-md);">
                                            <div>
                                                <h4>${leave.reason}</h4>
                                                <p style="color: var(--neutral-600);">${leave.className}</p>
                                            </div>
                                            <span class="badge ${leave.status === 'approved' ? 'badge-success' : leave.status === 'rejected' ? 'badge-error' : 'badge-warning'}">
                                                ${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                            </span>
                                        </div>
                                        <p style="margin-bottom: var(--space-sm);"><strong>Duration:</strong> ${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}</p>
                                        <p style="margin-bottom: var(--space-sm);"><strong>Details:</strong> ${leave.details}</p>
                                        ${leave.facultyComment ? `<p style="margin-bottom: var(--space-sm);"><strong>Faculty Comment:</strong> ${leave.facultyComment}</p>` : ''}
                                        <p style="font-size: var(--font-size-sm); color: var(--neutral-600);">Submitted: ${new Date(leave.submittedAt).toLocaleDateString()}</p>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p>No leave applications submitted yet.</p>'}
                    </div>
                </div>
            </div>
        `;

        // Add form submission handler
        document.getElementById('leave-application-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitLeaveApplication();
        });
    }

    submitLeaveApplication() {
        const formData = {
            classId: document.getElementById('leave-class').value,
            reason: document.getElementById('leave-reason').value,
            details: document.getElementById('leave-details').value,
            startDate: document.getElementById('leave-start-date').value,
            endDate: document.getElementById('leave-end-date').value
        };

        const classInfo = this.fakeData.classes.find(cls => cls.id === formData.classId);
        
        const leaveApplication = {
            id: 'leave' + Date.now(),
            studentId: this.currentUser.id,
            studentName: this.currentUser.name,
            classId: formData.classId,
            className: classInfo ? classInfo.name : 'Unknown Class',
            reason: formData.reason,
            details: formData.details,
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            facultyComment: ''
        };

        this.fakeData.leaveApplications.push(leaveApplication);
        this.saveToLocalStorage();
        
        this.showToast('Leave application submitted successfully!', 'success');
        this.loadLeaveApplicationPage(document.getElementById('content-area'));
    }

    // ===== LEAVE MANAGEMENT PAGE (FACULTY) =====
    loadLeaveManagementPage(container) {
        const userClasses = this.fakeData.classes.filter(cls => cls.facultyId === this.currentUser.id);
        const classIds = userClasses.map(cls => cls.id);
        const pendingLeaves = this.fakeData.leaveApplications.filter(leave => 
            classIds.includes(leave.classId) && leave.status === 'pending'
        );
        const allLeaves = this.fakeData.leaveApplications.filter(leave => 
            classIds.includes(leave.classId)
        );

        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Pending Leave Applications</h3>
                        <span class="badge badge-warning">${pendingLeaves.length} Pending</span>
                    </div>
                    <div class="card-content">
                        ${pendingLeaves.length > 0 ? `
                            <div class="grid grid-cols-1" style="gap: var(--space-lg);">
                                ${pendingLeaves.map(leave => `
                                    <div class="card">
                                        <div style="display: flex; justify-content: between; align-items: start; margin-bottom: var(--space-md);">
                                            <div>
                                                <h4>${leave.studentName}</h4>
                                                <p style="color: var(--neutral-600);">${leave.className} | ${leave.reason}</p>
                                            </div>
                                        </div>
                                        <p style="margin-bottom: var(--space-sm);"><strong>Duration:</strong> ${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}</p>
                                        <p style="margin-bottom: var(--space-lg);"><strong>Details:</strong> ${leave.details}</p>
                                        
                                        <div style="margin-bottom: var(--space-lg);">
                                            <label class="form-label">Faculty Comment (Optional)</label>
                                            <textarea class="form-textarea" id="comment-${leave.id}" placeholder="Add your comment..."></textarea>
                                        </div>
                                        
                                        <div style="display: flex; gap: var(--space-md);">
                                            <button class="btn btn-success" onclick="app.processLeaveApplication('${leave.id}', 'approved')">
                                                <i class="fas fa-check"></i>
                                                Approve
                                            </button>
                                            <button class="btn btn-error" onclick="app.processLeaveApplication('${leave.id}', 'rejected')">
                                                <i class="fas fa-times"></i>
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p>No pending leave applications.</p>'}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">All Leave Applications</h3>
                    </div>
                    <div class="card-content">
                        ${this.generateLeaveHistoryTable(allLeaves)}
                    </div>
                </div>
            </div>
        `;
    }

    processLeaveApplication(leaveId, status) {
        const leave = this.fakeData.leaveApplications.find(l => l.id === leaveId);
        const comment = document.getElementById(`comment-${leaveId}`).value;
        
        if (leave) {
            leave.status = status;
            leave.facultyComment = comment;
            leave[`${status}At`] = new Date().toISOString();
            
            this.saveToLocalStorage();
            this.showToast(`Leave application ${status}!`, status === 'approved' ? 'success' : 'warning');
            this.loadLeaveManagementPage(document.getElementById('content-area'));
        }
    }

    generateLeaveHistoryTable(leaves) {
        if (leaves.length === 0) {
            return '<p>No leave applications found.</p>';
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Reason</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${leaves.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).map(leave => `
                            <tr>
                                <td>${leave.studentName}</td>
                                <td>${leave.className}</td>
                                <td>${leave.reason}</td>
                                <td>${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}</td>
                                <td>
                                    <span class="badge ${leave.status === 'approved' ? 'badge-success' : leave.status === 'rejected' ? 'badge-error' : 'badge-warning'}">
                                        ${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                    </span>
                                </td>
                                <td>${new Date(leave.submittedAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // ===== CHATBOT PAGE =====
    loadChatbotPage(container) {
        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">AI Assistant</h3>
                        <span class="badge badge-info">Demo Mode</span>
                    </div>
                    <div class="card-content">
                        <div id="chatbot-messages" style="height: 400px; overflow-y: auto; border: 1px solid var(--neutral-200); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); background: var(--neutral-50);">
                            <div class="chatbot-message bot-message">
                                <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-sm);">
                                    <i class="fas fa-robot" style="color: var(--primary-600);"></i>
                                    <strong>AI Assistant</strong>
                                </div>
                                <p>Hello! I'm your AI assistant. I can help you with questions about your attendance, coins, and leave applications. Try asking me something!</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: var(--space-md);">
                            <input type="text" id="chatbot-input" class="form-input" placeholder="Ask me about your attendance, coins, or anything else..." style="flex: 1;">
                            <button class="btn btn-primary" onclick="app.sendChatMessage()">
                                <i class="fas fa-paper-plane"></i>
                                Send
                            </button>
                        </div>
                        
                        <div style="margin-top: var(--space-lg);">
                            <p style="font-size: var(--font-size-sm); color: var(--neutral-600);">Try these example questions:</p>
                            <div style="display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-sm);">
                                <button class="btn btn-sm btn-secondary" onclick="app.sendPredefinedMessage('What is my attendance percentage?')">Attendance %</button>
                                <button class="btn btn-sm btn-secondary" onclick="app.sendPredefinedMessage('How many coins do I have?')">My Coins</button>
                                <button class="btn btn-sm btn-secondary" onclick="app.sendPredefinedMessage('How can I improve my attendance?')">Improve Attendance</button>
                                <button class="btn btn-sm btn-secondary" onclick="app.sendPredefinedMessage('Submit leave application')">Submit Leave</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add enter key listener
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }

    sendChatMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (message) {
            this.addChatMessage(message, 'user');
            input.value = '';
            
            // Simulate processing
            setTimeout(() => {
                const response = this.generateChatbotResponse(message);
                this.addChatMessage(response, 'bot');
            }, 1000);
        }
    }

    sendPredefinedMessage(message) {
        document.getElementById('chatbot-input').value = message;
        this.sendChatMessage();
    }

    addChatMessage(message, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-sm); justify-content: flex-end;">
                    <strong>You</strong>
                    <i class="fas fa-user" style="color: var(--primary-600);"></i>
                </div>
                <div style="background: var(--primary-100); padding: var(--space-md); border-radius: var(--radius-md); text-align: right;">
                    <p>${message}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-sm);">
                    <i class="fas fa-robot" style="color: var(--primary-600);"></i>
                    <strong>AI Assistant</strong>
                </div>
                <div style="background: var(--neutral-0); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--neutral-200);">
                    <p>${message}</p>
                </div>
            `;
        }
        
        messageDiv.style.marginBottom = 'var(--space-lg)';
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateChatbotResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('attendance') && lowerMessage.includes('percentage')) {
            const attendance = this.calculateStudentAttendance(this.currentUser.id);
            return `Your current attendance percentage is ${attendance.percentage}%. You have attended ${attendance.present} classes and missed ${attendance.absent} classes.`;
        }
        
        if (lowerMessage.includes('coins') || lowerMessage.includes('coin')) {
            const currentUser = this.fakeData.users.find(u => u.id === this.currentUser.id);
            const coins = currentUser ? currentUser.coins : 0;
            return `You currently have ${coins} coins! You earn coins by attending classes regularly. Visit the coin store to spend them on badges and other items.`;
        }
        
        if (lowerMessage.includes('improve') && lowerMessage.includes('attendance')) {
            return `Here are some tips to improve your attendance: 1) Set reminders for your classes, 2) Plan your schedule in advance, 3) Communicate with faculty if you have conflicts, 4) Use the AI attendance system for quick check-ins.`;
        }
        
        if (lowerMessage.includes('leave') && (lowerMessage.includes('submit') || lowerMessage.includes('application'))) {
            return `To submit a leave application, go to the Leave Application page in your sidebar. Fill out the form with your reason, dates, and details. Your faculty will review and approve/reject the application.`;
        }
        
        if (lowerMessage.includes('leaderboard') || lowerMessage.includes('rank')) {
            const leaderboard = this.fakeData.leaderboard;
            const currentRank = leaderboard.findIndex(student => student.studentId === this.currentUser.id) + 1;
            return currentRank > 0 ? `You are currently ranked #${currentRank} on the leaderboard! Keep attending classes to earn more coins and climb higher.` : `You're not on the leaderboard yet. Attend more classes to earn coins and get ranked!`;
        }
        
        // Default responses
        const defaultResponses = [
            "I'm here to help with attendance, coins, and leave applications. Could you please rephrase your question?",
            "That's an interesting question! I can help you with attendance tracking, coin management, and leave applications.",
            "I'm a smart assistant focused on attendance management. Try asking about your attendance percentage, coins, or leave applications.",
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    // ===== PROFILE PAGE =====
    loadProfilePage(container) {
        container.innerHTML = `
            <div class="animate-fade-in">
                <div class="grid grid-cols-2">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Profile Information</h3>
                        </div>
                        <div class="card-content">
                            <div style="text-align: center; margin-bottom: var(--space-lg);">
                                <img src="${this.currentUser.profilePic}" class="avatar avatar-lg" style="margin-bottom: var(--space-md);">
                                <h3>${this.currentUser.name}</h3>
                                <p style="color: var(--neutral-600); text-transform: capitalize;">${this.currentUser.role}</p>
                            </div>
                            
                            <form id="profile-form">
                                <div class="form-group">
                                    <label class="form-label">Name</label>
                                    <input type="text" class="form-input" value="${this.currentUser.name}" id="profile-name">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" value="${this.currentUser.email}" id="profile-email">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" class="form-input" value="${this.currentUser.phone}" id="profile-phone">
                                </div>
                                
                                ${this.currentUser.role === 'student' ? `
                                    <div class="form-group">
                                        <label class="form-label">Roll Number</label>
                                        <input type="text" class="form-input" value="${this.currentUser.roll}" readonly>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">Department</label>
                                        <input type="text" class="form-input" value="${this.currentUser.department}" readonly>
                                    </div>
                                ` : ''}
                                
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i>
                                    Update Profile
                                </button>
                            </form>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Settings</h3>
                        </div>
                        <div class="card-content">
                            <div style="display: grid; gap: var(--space-lg);">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>Dark Mode</strong>
                                        <p style="font-size: var(--font-size-sm); color: var(--neutral-600);">Toggle dark/light theme</p>
                                    </div>
                                    <button class="btn btn-secondary" onclick="app.toggleTheme()">
                                        <i class="fas ${this.isDarkMode ? 'fa-sun' : 'fa-moon'}"></i>
                                        ${this.isDarkMode ? 'Light' : 'Dark'} Mode
                                    </button>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>Reset Demo</strong>
                                        <p style="font-size: var(--font-size-sm); color: var(--neutral-600);">Reset all demo data</p>
                                    </div>
                                    <button class="btn btn-warning" onclick="app.resetDemoData()">
                                        <i class="fas fa-refresh"></i>
                                        Reset
                                    </button>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>Export Data</strong>
                                        <p style="font-size: var(--font-size-sm); color: var(--neutral-600);">Download your data</p>
                                    </div>
                                    <button class="btn btn-secondary" onclick="app.exportUserData()">
                                        <i class="fas fa-download"></i>
                                        Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add form submission handler
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });
    }

    updateProfile() {
        const name = document.getElementById('profile-name').value;
        const email = document.getElementById('profile-email').value;
        const phone = document.getElementById('profile-phone').value;
        
        // Update current user
        this.currentUser.name = name;
        this.currentUser.email = email;
        this.currentUser.phone = phone;
        
        // Update in fake data
        const userIndex = this.fakeData.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.fakeData.users[userIndex] = { ...this.currentUser };
        }
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.saveToLocalStorage();
        
        // Update UI
        this.updateUserInfo();
        this.showToast('Profile updated successfully!', 'success');
    }

    exportUserData() {
        const userData = {
            user: this.currentUser,
            attendance: this.fakeData.attendanceRecords.filter(record => 
                record.presentStudentIds.includes(this.currentUser.id) || 
                record.absentStudentIds.includes(this.currentUser.id)
            ),
            leaves: this.fakeData.leaveApplications.filter(leave => leave.studentId === this.currentUser.id),
            coinHistory: this.fakeData.coinHistory?.find(h => h.studentId === this.currentUser.id)
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        if (window.saveAs) {
            window.saveAs(dataBlob, `user-data-${this.currentUser.id}.json`);
        } else {
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user-data-${this.currentUser.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        this.showToast('Data exported successfully!', 'success');
    }

    // ===== CHART UTILITIES =====
    createAttendanceChart(canvasId, attendanceData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent'],
                datasets: [{
                    data: [attendanceData.present, attendanceData.absent],
                    backgroundColor: ['#28A745', '#DC3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    createStudentAttendanceChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Generate sample data for last 7 days
        const labels = [];
        const data = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            data.push(Math.random() > 0.2 ? 1 : 0); // 80% attendance rate simulation
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Attendance',
                    data: data,
                    borderColor: '#6366F1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            callback: function(value) {
                                return value === 1 ? 'Present' : 'Absent';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        // Mobile menu toggle
        document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('mobile-open');
        });

        // User dropdown
        const userDropdown = document.querySelector('.user-dropdown');
        const userDropdownToggle = document.querySelector('.user-dropdown-toggle');
        const userDropdownMenu = document.querySelector('.user-dropdown-menu');

        userDropdownToggle.addEventListener('click', () => {
            const isVisible = userDropdownMenu.style.display === 'block';
            userDropdownMenu.style.display = isVisible ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target)) {
                userDropdownMenu.style.display = 'none';
            }
        });

        // Close modal when clicking backdrop
        document.getElementById('modal-container').addEventListener('click', (e) => {
            if (e.target.id === 'modal-container') {
                this.closeModal();
            }
        });
    }

    updateUserInfo() {
        // Update sidebar user info
        document.getElementById('user-name').textContent = this.currentUser.name;
        document.getElementById('user-role').textContent = this.currentUser.role;
        document.getElementById('user-avatar').src = this.currentUser.profilePic;
        
        // Update header user info
        document.getElementById('header-avatar').src = this.currentUser.profilePic;
    }

    // ===== PLACEHOLDER IMPLEMENTATIONS =====
    loadClassesPage(container) { this.loadFacultyAttendancePage(container); }
    loadReportsPage(container) { 
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Reports & Analytics</h3>
                </div>
                <div class="card-content">
                    <p>Reports feature will be implemented here. Export attendance data as CSV/PDF.</p>
                    <button class="btn btn-primary" onclick="app.exportAttendanceCSV()">
                        <i class="fas fa-download"></i>
                        Export CSV
                    </button>
                </div>
            </div>
        `;
    }
    
    loadChildAttendancePage(container) { this.loadParentDashboard(container); }
    loadTimetablePage(container) { 
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Class Timetable</h3>
                </div>
                <div class="card-content">
                    <p>Timetable feature will be implemented here.</p>
                </div>
            </div>
        `;
    }
    
    loadNotificationsPage(container) { 
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Notifications</h3>
                </div>
                <div class="card-content">
                    <p>Notifications feature will be implemented here.</p>
                </div>
            </div>
        `;
    }

    exportAttendanceCSV() {
        // Simple CSV export implementation
        const headers = ['Date', 'Class', 'Student', 'Status'];
        const rows = [headers.join(',')];
        
        this.fakeData.attendanceRecords.forEach(record => {
            const classInfo = this.fakeData.classes.find(cls => cls.id === record.classId);
            
            record.presentStudentIds.forEach(studentId => {
                const student = this.fakeData.users.find(u => u.id === studentId);
                rows.push([record.date, classInfo?.name || 'Unknown', student?.name || 'Unknown', 'Present'].join(','));
            });
            
            record.absentStudentIds.forEach(studentId => {
                const student = this.fakeData.users.find(u => u.id === studentId);
                rows.push([record.date, classInfo?.name || 'Unknown', student?.name || 'Unknown', 'Absent'].join(','));
            });
        });
        
        const csvContent = rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        
        if (window.saveAs) {
            window.saveAs(blob, 'attendance-report.csv');
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'attendance-report.csv';
            a.click();
            URL.revokeObjectURL(url);
        }
        
        this.showToast('Attendance report exported!', 'success');
    }

    viewAttendanceHistory(classId) {
        const classInfo = this.fakeData.classes.find(cls => cls.id === classId);
        const classRecords = this.fakeData.attendanceRecords.filter(record => record.classId === classId);
        
        const modalContent = `
            <div>
                <h4>Attendance History for ${classInfo?.name}</h4>
                <div style="margin-top: var(--space-lg);">
                    ${classRecords.length > 0 ? `
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Present</th>
                                        <th>Absent</th>
                                        <th>Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${classRecords.map(record => `
                                        <tr>
                                            <td>${new Date(record.date).toLocaleDateString()}</td>
                                            <td>${record.presentStudentIds.length}</td>
                                            <td>${record.absentStudentIds.length}</td>
                                            <td><span class="badge badge-info">${record.method}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p>No attendance records found for this class.</p>'}
                </div>
            </div>
        `;
        
        this.showModal('Attendance History', modalContent);
    }
}

// ===== INITIALIZE APPLICATION =====
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SmartAttendanceSystem();
});

// TODO: Integration points for real backend
// 1. Replace loadFakeData() with actual API calls to fetch user data, classes, attendance records
// 2. Replace saveToLocalStorage() with API calls to save attendance records to backend
// 3. Replace simulateAIProcessing() with real ML model API calls for face recognition
// 4. Add real-time notifications using WebSocket connections
// 5. Implement actual file upload for photos in AI attendance
// 6. Add proper authentication with JWT tokens
// 7. Implement role-based access control on backend
// 8. Add data validation and sanitization for all form inputs
// 9. Replace Chart.js with real-time data from backend analytics
// 10. Add email notifications for leave applications and approvals