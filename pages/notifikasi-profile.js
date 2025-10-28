// notifikasi-profile.js - FIXED VERSION

console.log('🔔 Loading notifications-profile module (FIXED)...');

// ========== NOTIFICATIONS ==========

let notifications = [];

// Initialize Notifications
function initNotifications() {
    console.log('🔔 Initializing notifications...');
    
    const stored = localStorage.getItem('notifications');
    if (stored) {
        notifications = JSON.parse(stored);
    } else {
        notifications = [
            {
                id: Date.now(),
                type: 'welcome',
                title: 'Selamat Datang! 🎉',
                message: 'Terima kasih telah menggunakan Aplikasi Keuangan GenZ',
                time: new Date().toISOString(),
                read: false
            }
        ];
        saveNotifications();
    }
    
    updateNotificationBadge();
}

// Save Notifications
function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationBadge();
}

// Add Notification
function addNotification(type, title, message) {
    const notification = {
        id: Date.now(),
        type: type,
        title: title,
        message: message,
        time: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    
    if (notifications.length > 20) {
        notifications = notifications.slice(0, 20);
    }
    
    saveNotifications();
    showToast(title, type);
}

// Update Notification Badge
function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    let badge = document.querySelector('.notification-badge');
    const bellBtn = document.querySelector('[title="Notifikasi"]');
    
    if (!badge && bellBtn && unreadCount > 0) {
        badge = document.createElement('span');
        badge.className = 'notification-badge';
        bellBtn.style.position = 'relative';
        bellBtn.appendChild(badge);
    }
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// ✅ FIXED: Show Notifications Modal
function showNotifications() {
    console.log('🔔 Opening notifications modal...');
    
    // Close any existing modals
    closeAllModals();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = closeNotificationModal;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'notification-modal';
    modal.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <h3>🔔 Notifikasi</h3>
                <div class="notification-actions">
                    ${notifications.filter(n => !n.read).length > 0 ? 
                        '<button class="btn-mark-all" onclick="markAllAsRead()">✓ Tandai Semua Dibaca</button>' : 
                        ''}
                    <button class="btn-close-modal" onclick="closeNotificationModal()">✕</button>
                </div>
            </div>
            <div class="notification-list" id="notificationList">
                ${notifications.length === 0 ? 
                    '<div class="no-notifications">Tidak ada notifikasi</div>' :
                    notifications.map(n => createNotificationItem(n)).join('')
                }
            </div>
        </div>
    `;
    
    // Append to body
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Trigger animation
    setTimeout(() => {
        overlay.classList.add('active');
        modal.classList.add('show');
    }, 10);
    
    // Mark as read after 1 second
    setTimeout(() => {
        notifications.forEach(n => n.read = true);
        saveNotifications();
    }, 1000);
}

// Create Notification Item
function createNotificationItem(notification) {
    const icons = {
        success: '✅',
        warning: '⚠️',
        info: 'ℹ️',
        error: '❌',
        welcome: '🎉'
    };
    
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
        error: '#ef4444',
        welcome: '#8b5cf6'
    };
    
    const timeAgo = getTimeAgo(notification.time);
    
    return `
        <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
            <div class="notification-icon" style="background: ${colors[notification.type]}20; color: ${colors[notification.type]}">
                ${icons[notification.type] || '📌'}
            </div>
            <div class="notification-body">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${timeAgo}</div>
            </div>
            <button class="btn-delete-notif" onclick="deleteNotification(${notification.id})" title="Hapus">
                🗑️
            </button>
        </div>
    `;
}

// Get Time Ago
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Baru saja';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// Close Notification Modal
function closeNotificationModal() {
    const modal = document.querySelector('.notification-modal');
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal) {
        modal.classList.remove('show');
    }
    
    if (overlay) {
        overlay.classList.remove('active');
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    setTimeout(() => {
        if (modal) modal.remove();
        if (overlay) overlay.remove();
    }, 400);
}

// Mark All as Read
function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    saveNotifications();
    
    const list = document.getElementById('notificationList');
    if (list) {
        list.innerHTML = notifications.map(n => createNotificationItem(n)).join('');
    }
    
    document.querySelector('.btn-mark-all')?.remove();
}

// Delete Notification
function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveNotifications();
    
    const item = document.querySelector(`[data-id="${id}"]`);
    if (item) {
        item.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            item.remove();
            
            const list = document.getElementById('notificationList');
            if (notifications.length === 0 && list) {
                list.innerHTML = '<div class="no-notifications">Tidak ada notifikasi</div>';
            }
        }, 300);
    }
}

// Show Toast
function showToast(message, type = 'info') {
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
        error: '#ef4444'
    };
    
    const icons = {
        success: '✅',
        warning: '⚠️',
        info: 'ℹ️',
        error: '❌'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.borderLeftColor = colors[type];
    toast.innerHTML = `
        <span style="font-size: 24px;">${icons[type] || 'ℹ️'}</span>
        <span style="font-weight: 600;">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== PROFILE ==========

// ✅ FIXED: Show Profile Modal
function showProfile() {
    console.log('👤 Opening profile modal...');
    
    // Close any existing modals
    closeAllModals();
    
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const namaLengkap = localStorage.getItem('namaLengkap');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = closeProfileModal;
    
    // Create modal with LOADING STATE first
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.innerHTML = `
        <div class="profile-content">
            <button class="btn-close-modal" onclick="closeProfileModal()" style="position: absolute; top: 15px; right: 15px; z-index: 100;">✕</button>
            
            <div class="profile-header">
                <div class="profile-avatar">
                    ${(namaLengkap || username || 'U').charAt(0).toUpperCase()}
                </div>
                <h2>${namaLengkap || username || 'User'}</h2>
                <p class="profile-username">@${username || 'user'}</p>
            </div>
            
            <div class="profile-stats" id="profileStats">
                <div class="profile-stat">
                    <div class="stat-icon" style="font-size: 40px; animation: spin 1s linear infinite;">⏳</div>
                    <div class="stat-value">...</div>
                    <div class="stat-label">Loading...</div>
                </div>
            </div>
            
            <div class="profile-menu">
                <a href="javascript:void(0)" onclick="window.showProfileSettings()" class="profile-menu-item">
                    <span class="menu-icon">⚙️</span>
                    <span class="menu-text">Pengaturan Profile</span>
                    <span class="menu-arrow">→</span>
                </a>
                <a href="transaksi.html" class="profile-menu-item">
                    <span class="menu-icon">💳</span>
                    <span class="menu-text">Tambah Transaksi</span>
                    <span class="menu-arrow">→</span>
                </a>
                <a href="laporan.html" class="profile-menu-item">
                    <span class="menu-icon">📊</span>
                    <span class="menu-text">Lihat Laporan</span>
                    <span class="menu-arrow">→</span>
                </a>
                <a href="riwayat.html" class="profile-menu-item">
                    <span class="menu-icon">📜</span>
                    <span class="menu-text">Riwayat Transaksi</span>
                    <span class="menu-arrow">→</span>
                </a>
                <a href="javascript:void(0)" onclick="window.exportPDF ? window.exportPDF() : alert('Export PDF tidak tersedia')" class="profile-menu-item">
                    <span class="menu-icon">📄</span>
                    <span class="menu-text">Export PDF</span>
                    <span class="menu-arrow">→</span>
                </a>
                <div class="profile-divider"></div>
                <a href="javascript:void(0)" onclick="window.logout ? window.logout() : alert('Logout tidak tersedia')" class="profile-menu-item danger">
                    <span class="menu-icon">🚪</span>
                    <span class="menu-text">Logout</span>
                    <span class="menu-arrow">→</span>
                </a>
            </div>
        </div>
    `;
    
    // Append to body
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Trigger animation
    setTimeout(() => {
        overlay.classList.add('active');
        modal.classList.add('show');
    }, 10);
    
    // Load stats AFTER modal is shown
    loadProfileStats();
}

// Load Profile Stats
async function loadProfileStats() {
    const statsDiv = document.getElementById('profileStats');
    
    if (!statsDiv) {
        console.error('❌ Stats div not found!');
        return;
    }
    
    try {
        console.log('📊 Loading profile stats...');
        
        // Show loading animation with progress
        let loadingProgress = 0;
        const progressInterval = setInterval(() => {
            loadingProgress += 33.33; // 100% dalam 3 detik (setiap 1 detik = 33.33%)
            if (loadingProgress <= 100) {
                statsDiv.innerHTML = `
                    <div class="profile-stat" style="opacity: 0.6;">
                        <div class="stat-icon" style="font-size: 40px; animation: spin 1s linear infinite;">⏳</div>
                        <div class="stat-value">Loading...</div>
                        <div class="stat-label">Mengambil data</div>
                        <div style="margin-top: 10px; background: #e5e7eb; height: 4px; border-radius: 2px; overflow: hidden;">
                            <div style="width: ${Math.min(loadingProgress, 100)}%; height: 100%; background: linear-gradient(90deg, #4ade80, #22c55e); transition: width 1s ease;"></div>
                        </div>
                        <div style="font-size: 0.75rem; color: #999; margin-top: 5px;">${Math.round(loadingProgress)}%</div>
                    </div>
                `;
            }
        }, 1000); // Update setiap 1 detik
        
        // ✅ FIXED: Minimum loading duration 3 detik
        const startTime = Date.now();
        const minLoadingTime = 3000; // 3 detik
        
        // Fetch data (parallel)
        const [summary, transaksi] = await Promise.all([
            calculateSummary(),
            getTransaksiData()
        ]);
        
        // Calculate remaining time to reach minimum duration
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        console.log(`⏱️ Data loaded in ${elapsedTime}ms, waiting ${remainingTime}ms more...`);
        
        // Wait for remaining time if needed
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        // Clear progress interval
        clearInterval(progressInterval);
        
        console.log('✅ Stats ready after 3s:', { transaksi: transaksi.length, saldo: summary.saldo });
        
        // Update with real data - dengan animasi fade in
        statsDiv.style.opacity = '0';
        statsDiv.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            statsDiv.innerHTML = `
                <div class="profile-stat" style="animation: fadeInUp 0.5s ease;">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${transaksi.length}</div>
                    <div class="stat-label">Transaksi</div>
                </div>
                <div class="profile-stat" style="animation: fadeInUp 0.5s ease 0.15s both;">
                    <div class="stat-icon">💵</div>
                    <div class="stat-value" style="font-size: 0.85rem;">${formatRupiah(summary.saldo)}</div>
                    <div class="stat-label">Saldo</div>
                </div>
                <div class="profile-stat" style="animation: fadeInUp 0.5s ease 0.3s both;">
                    <div class="stat-icon">${summary.saldo >= 0 ? '📈' : '📉'}</div>
                    <div class="stat-value" style="color: ${summary.saldo >= 0 ? '#10b981' : '#ef4444'}; font-size: 0.85rem;">
                        ${summary.saldo >= 0 ? 'Surplus' : 'Defisit'}
                    </div>
                    <div class="stat-label">Status</div>
                </div>
            `;
            
            statsDiv.style.opacity = '1';
        }, 100);
        
    } catch (error) {
        console.error('❌ Error loading profile stats:', error);
        
        // Show error state (after minimum loading time)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        statsDiv.innerHTML = `
            <div class="profile-stat" style="opacity: 0.8;">
                <div class="stat-icon" style="font-size: 40px;">⚠️</div>
                <div class="stat-value" style="color: #ef4444; font-size: 0.9rem;">Error</div>
                <div class="stat-label" style="font-size: 0.8rem;">Gagal memuat data</div>
            </div>
        `;
    }
}

// Close Profile Modal
function closeProfileModal() {
    const modal = document.querySelector('.profile-modal');
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal) {
        modal.classList.remove('show');
    }
    
    if (overlay) {
        overlay.classList.remove('active');
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    setTimeout(() => {
        if (modal) modal.remove();
        if (overlay) overlay.remove();
    }, 400);
}

// Close All Modals
function closeAllModals() {
    closeNotificationModal();
    closeProfileModal();
}

// ========== PROFILE SETTINGS ==========

// Show Profile Settings
function showProfileSettings() {
    console.log('⚙️ Opening profile settings...');
    
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const namaLengkap = localStorage.getItem('namaLengkap');
    
    // Find and update existing modal
    const modal = document.querySelector('.profile-modal');
    if (!modal) return;
    
    modal.innerHTML = `
        <div class="profile-content">
            <button class="btn-close-modal" onclick="closeProfileModal()" style="position: absolute; top: 15px; right: 15px; z-index: 100;">✕</button>
            
            <div class="profile-header">
                <div class="profile-avatar">
                    ${(namaLengkap || username || 'U').charAt(0).toUpperCase()}
                </div>
                <h2>⚙️ Pengaturan Profile</h2>
            </div>
            
            <div class="profile-settings-content">
                <div class="settings-section">
                    <h3 class="settings-title">📝 Informasi Akun</h3>
                    
                    <form id="profileForm" onsubmit="saveProfileSettings(event)">
                        <div class="form-group-settings">
                            <label>👤 Nama Lengkap</label>
                            <input 
                                type="text" 
                                id="editNamaLengkap" 
                                value="${namaLengkap || ''}" 
                                placeholder="Masukkan nama lengkap"
                                required
                                minlength="3"
                            >
                        </div>
                        
                        <div class="form-group-settings">
                            <label>🔑 Username</label>
                            <input 
                                type="text" 
                                value="${username || ''}" 
                                disabled
                                style="background: #f3f4f6; cursor: not-allowed;"
                            >
                            <small style="color: #999; font-size: 0.85rem; display: block; margin-top: 5px;">
                                Username tidak dapat diubah
                            </small>
                        </div>
                        
                        <button type="submit" class="btn-save-profile" id="saveProfileBtn">
                            💾 Simpan Perubahan
                        </button>
                    </form>
                </div>
                
                <div class="settings-divider"></div>
                
                <div class="settings-section">
                    <h3 class="settings-title">🔐 Keamanan</h3>
                    
                    <form id="passwordForm" onsubmit="changePassword(event)">
                        <div class="form-group-settings">
                            <label>🔒 Password Lama</label>
                            <input 
                                type="password" 
                                id="oldPassword" 
                                placeholder="Masukkan password lama"
                                required
                            >
                        </div>
                        
                        <div class="form-group-settings">
                            <label>🔓 Password Baru</label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                placeholder="Masukkan password baru"
                                required
                                minlength="6"
                            >
                        </div>
                        
                        <div class="form-group-settings">
                            <label>✅ Konfirmasi Password Baru</label>
                            <input 
                                type="password" 
                                id="confirmNewPassword" 
                                placeholder="Ketik ulang password baru"
                                required
                                minlength="6"
                            >
                        </div>
                        
                        <button type="submit" class="btn-change-password" id="changePasswordBtn">
                            🔐 Ubah Password
                        </button>
                    </form>
                </div>
                
                <div class="settings-divider"></div>
                
                <button class="btn-back-profile" onclick="backToProfile()">
                    ← Kembali ke Profile
                </button>
            </div>
        </div>
    `;
}

// Save Profile Settings
async function saveProfileSettings(event) {
    event.preventDefault();
    
    const namaLengkap = document.getElementById('editNamaLengkap').value.trim();
    const saveBtn = document.getElementById('saveProfileBtn');
    
    if (!namaLengkap) {
        alert('❌ Nama lengkap tidak boleh kosong!');
        return;
    }
    
    if (namaLengkap.length < 3) {
        alert('❌ Nama lengkap minimal 3 karakter!');
        return;
    }
    
    // Show loading
    saveBtn.disabled = true;
    saveBtn.innerHTML = '⏳ Menyimpan...';
    
    try {
        // Update localStorage
        localStorage.setItem('namaLengkap', namaLengkap);
        
        // Show success
        showToast('✅ Profile berhasil diperbarui!', 'success');
        
        // Add notification
        addNotification(
            'success',
            '✅ Profile Diperbarui',
            `Nama lengkap berhasil diubah menjadi: ${namaLengkap}`
        );
        
        // Update button
        saveBtn.innerHTML = '✅ Tersimpan!';
        
        setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 Simpan Perubahan';
            
            // Back to profile view
            backToProfile();
        }, 1500);
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('❌ Gagal menyimpan perubahan: ' + error.message);
        
        saveBtn.disabled = false;
        saveBtn.innerHTML = '💾 Simpan Perubahan';
    }
}

// Change Password
async function changePassword(event) {
    event.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const changeBtn = document.getElementById('changePasswordBtn');
    
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
        alert('❌ Semua field password harus diisi!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('❌ Password baru minimal 6 karakter!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('❌ Password baru dan konfirmasi tidak cocok!');
        return;
    }
    
    if (oldPassword === newPassword) {
        alert('⚠️ Password baru tidak boleh sama dengan password lama!');
        return;
    }
    
    // Show loading
    changeBtn.disabled = true;
    changeBtn.innerHTML = '⏳ Mengubah...';
    
    try {
        const response = await fetch('http://localhost/keuangangenz/api/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast('✅ Password berhasil diubah!', 'success');
            
            // Add notification
            addNotification(
                'success',
                '🔐 Password Diubah',
                'Password akun Anda berhasil diperbarui'
            );
            
            // Clear form
            document.getElementById('passwordForm').reset();
            
            // Update button
            changeBtn.innerHTML = '✅ Berhasil!';
            
            setTimeout(() => {
                changeBtn.disabled = false;
                changeBtn.innerHTML = '🔐 Ubah Password';
            }, 2000);
            
        } else {
            alert('❌ ' + (result.message || 'Gagal mengubah password'));
            
            changeBtn.disabled = false;
            changeBtn.innerHTML = '🔐 Ubah Password';
        }
        
    } catch (error) {
        console.error('Error changing password:', error);
        alert('❌ Terjadi kesalahan: ' + error.message);
        
        changeBtn.disabled = false;
        changeBtn.innerHTML = '🔐 Ubah Password';
    }
}

// Back to Profile View
function backToProfile() {
    console.log('← Back to profile...');
    closeProfileModal();
    
    // Reopen profile after short delay
    setTimeout(() => {
        showProfile();
    }, 300);
}

// ========== PROFILE SETTINGS ==========

// Show Profile Settings
function showProfileSettings() {
    console.log('⚙️ Opening profile settings...');
    
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const namaLengkap = localStorage.getItem('namaLengkap');
    
    // Find and update existing modal
    const modal = document.querySelector('.profile-modal');
    if (!modal) {
        console.error('❌ Profile modal not found!');
        return;
    }
    
    modal.innerHTML = `
        <div class="profile-content">
            <button class="btn-close-modal" onclick="closeProfileModal()" style="position: absolute; top: 15px; right: 15px; z-index: 100;">✕</button>
            
            <div class="profile-header">
                <div class="profile-avatar">
                    ${(namaLengkap || username || 'U').charAt(0).toUpperCase()}
                </div>
                <h2>⚙️ Pengaturan Profile</h2>
            </div>
            
            <div class="profile-settings-content">
                <div class="settings-section">
                    <h3 class="settings-title">📝 Informasi Akun</h3>
                    
                    <form id="profileForm" onsubmit="event.preventDefault(); window.saveProfileSettings(event);">
                        <div class="form-group-settings">
                            <label>👤 Nama Lengkap</label>
                            <input 
                                type="text" 
                                id="editNamaLengkap" 
                                value="${namaLengkap || ''}" 
                                placeholder="Masukkan nama lengkap"
                                required
                                minlength="3"
                            >
                        </div>
                        
                        <div class="form-group-settings">
                            <label>🔑 Username</label>
                            <input 
                                type="text" 
                                value="${username || ''}" 
                                disabled
                                style="background: #f3f4f6; cursor: not-allowed;"
                            >
                            <small style="color: #999; font-size: 0.85rem; display: block; margin-top: 5px;">
                                Username tidak dapat diubah
                            </small>
                        </div>
                        
                        <button type="submit" class="btn-save-profile" id="saveProfileBtn">
                            💾 Simpan Perubahan
                        </button>
                    </form>
                </div>
                
                <div class="settings-divider"></div>
                
                <div class="settings-section">
                    <h3 class="settings-title">🔐 Keamanan</h3>
                    
                    <form id="passwordForm" onsubmit="event.preventDefault(); window.changePassword(event);">
                        <div class="form-group-settings">
                            <label>🔒 Password Lama</label>
                            <input 
                                type="password" 
                                id="oldPassword" 
                                placeholder="Masukkan password lama"
                                required
                            >
                        </div>
                        
                        <div class="form-group-settings">
                            <label>🔓 Password Baru</label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                placeholder="Masukkan password baru"
                                required
                                minlength="6"
                            >
                        </div>
                        
                        <div class="form-group-settings">
                            <label>✅ Konfirmasi Password Baru</label>
                            <input 
                                type="password" 
                                id="confirmNewPassword" 
                                placeholder="Ketik ulang password baru"
                                required
                                minlength="6"
                            >
                        </div>
                        
                        <button type="submit" class="btn-change-password" id="changePasswordBtn">
                            🔐 Ubah Password
                        </button>
                    </form>
                </div>
                
                <div class="settings-divider"></div>
                
                <button class="btn-back-profile" onclick="window.backToProfile()">
                    ← Kembali ke Profile
                </button>
            </div>
        </div>
    `;
    
    console.log('✅ Profile settings view loaded');
}

// Save Profile Settings
async function saveProfileSettings(event) {
    if (event) event.preventDefault();
    
    const namaLengkap = document.getElementById('editNamaLengkap').value.trim();
    const saveBtn = document.getElementById('saveProfileBtn');
    
    if (!namaLengkap) {
        alert('❌ Nama lengkap tidak boleh kosong!');
        return;
    }
    
    if (namaLengkap.length < 3) {
        alert('❌ Nama lengkap minimal 3 karakter!');
        return;
    }
    
    // Show loading
    saveBtn.disabled = true;
    saveBtn.innerHTML = '⏳ Menyimpan...';
    
    try {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update localStorage
        localStorage.setItem('namaLengkap', namaLengkap);
        
        // Show success
        showToast('✅ Profile berhasil diperbarui!', 'success');
        
        // Add notification
        if (typeof addNotification === 'function') {
            addNotification(
                'success',
                '✅ Profile Diperbarui',
                `Nama lengkap berhasil diubah menjadi: ${namaLengkap}`
            );
        }
        
        // Update button
        saveBtn.innerHTML = '✅ Tersimpan!';
        
        setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 Simpan Perubahan';
            
            // Back to profile view
            backToProfile();
        }, 1500);
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('❌ Gagal menyimpan perubahan: ' + error.message);
        
        saveBtn.disabled = false;
        saveBtn.innerHTML = '💾 Simpan Perubahan';
    }
}

// Change Password
async function changePassword(event) {
    if (event) event.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const changeBtn = document.getElementById('changePasswordBtn');
    
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
        alert('❌ Semua field password harus diisi!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('❌ Password baru minimal 6 karakter!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('❌ Password baru dan konfirmasi tidak cocok!');
        return;
    }
    
    if (oldPassword === newPassword) {
        alert('⚠️ Password baru tidak boleh sama dengan password lama!');
        return;
    }
    
    // Show loading
    changeBtn.disabled = true;
    changeBtn.innerHTML = '⏳ Mengubah...';
    
    try {
        const response = await fetch('http://localhost/keuangangenz/api/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast('✅ Password berhasil diubah!', 'success');
            
            // Add notification
            if (typeof addNotification === 'function') {
                addNotification(
                    'success',
                    '🔐 Password Diubah',
                    'Password akun Anda berhasil diperbarui'
                );
            }
            
            // Clear form
            document.getElementById('passwordForm').reset();
            
            // Update button
            changeBtn.innerHTML = '✅ Berhasil!';
            
            setTimeout(() => {
                changeBtn.disabled = false;
                changeBtn.innerHTML = '🔐 Ubah Password';
            }, 2000);
            
        } else {
            alert('❌ ' + (result.message || 'Gagal mengubah password'));
            
            changeBtn.disabled = false;
            changeBtn.innerHTML = '🔐 Ubah Password';
        }
        
    } catch (error) {
        console.error('Error changing password:', error);
        alert('❌ Terjadi kesalahan: ' + error.message);
        
        changeBtn.disabled = false;
        changeBtn.innerHTML = '🔐 Ubah Password';
    }
}

// Back to Profile View
function backToProfile() {
    console.log('← Back to profile...');
    closeProfileModal();
    
    // Reopen profile after short delay
    setTimeout(() => {
        showProfile();
    }, 300);
}

// ========== AUTO NOTIFICATIONS ==========

async function monitorTransactions() {
    const lastCheck = localStorage.getItem('lastNotificationCheck');
    const now = Date.now();
    
    if (!lastCheck || (now - parseInt(lastCheck)) > 300000) {
        try {
            const summary = await calculateSummary();
            
            if (summary.saldo < 0) {
                const hasDeficitNotif = notifications.some(n => 
                    n.type === 'warning' && 
                    n.title.includes('Defisit') && 
                    (now - new Date(n.time).getTime()) < 86400000
                );
                
                if (!hasDeficitNotif) {
                    addNotification(
                        'warning',
                        '⚠️ Peringatan Defisit',
                        `Saldo Anda minus ${formatRupiah(Math.abs(summary.saldo))}. Kurangi pengeluaran!`
                    );
                }
            }
            
            localStorage.setItem('lastNotificationCheck', now.toString());
        } catch (error) {
            console.error('Error monitoring transactions:', error);
        }
    }
}

// ========== ATTACH TO WINDOW ==========

if (typeof window !== 'undefined') {
    // Notification functions
    window.initNotifications = initNotifications;
    window.addNotification = addNotification;
    window.showNotifications = showNotifications;
    window.closeNotificationModal = closeNotificationModal;
    window.markAllAsRead = markAllAsRead;
    window.deleteNotification = deleteNotification;
    
    // Profile functions
    window.showProfile = showProfile;
    window.closeProfileModal = closeProfileModal;
    window.showProfileSettings = showProfileSettings;
    window.saveProfileSettings = saveProfileSettings;
    window.changePassword = changePassword;
    window.backToProfile = backToProfile;
    
    // Utility functions
    window.monitorTransactions = monitorTransactions;
    window.closeAllModals = closeAllModals;
    
    console.log('✅ Notifications & Profile functions attached to window');
    console.log('📋 Available functions:', {
        notification: 'showNotifications, addNotification',
        profile: 'showProfile, showProfileSettings',
        settings: 'saveProfileSettings, changePassword, backToProfile'
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing notifications & profile...');
    initNotifications();
    monitorTransactions();
    setInterval(monitorTransactions, 300000); // Check every 5 minutes
    
    // Close modals when ESC key is pressed
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
});

console.log('✅ Notifications & Profile module (FIXED) loaded successfully')