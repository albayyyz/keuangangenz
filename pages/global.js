// global.js - FIXED: Export PDF Ready

// API Base URL
const API_URL = 'http://localhost/keuangangenz/api';

// Check login status - IMPROVED VERSION
async function checkLogin() {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    console.log('🔍 Current file:', currentFile);
    
    // Skip auth check untuk login.html
    if (currentFile === 'login.html' || currentFile === '') {
        console.log('✅ On login page, skipping auth check');
        return true;
    }
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');
    
    console.log('🔍 Auth check:', { isLoggedIn, userId });
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !userId) {
        console.log('❌ Not logged in, redirecting to login...');
        window.location.href = 'login.html';
        return false;
    }
    
    console.log('✅ Auth passed');
    return true;
}

// Initialize on page load - IMPROVED
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    console.log('📄 Page loaded:', currentFile || 'index');
    
    // Skip untuk login page
    if (currentFile === 'login.html' || currentFile === '') {
        console.log('🚫 Login page detected, not checking auth');
        return;
    }
    
    console.log('🔒 Running auth check...');
    checkLogin();
});

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = closeSidebar;
        document.body.appendChild(overlay);
    }
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Close Sidebar
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('active');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Logout Function
function logout() {
    if (confirm('Yakin ingin logout?')) {
        console.log('🚪 Logging out...');
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// ⚠️ HAPUS FUNGSI INI - Sekarang ada di export-pdf.js
// function exportPDF() {
//     alert('Fitur Export PDF sedang dalam pengembangan');
// }

// ========== API FUNCTIONS ==========

// Get Transaksi Data from API
async function getTransaksiData(filters = {}) {
    try {
        let url = `${API_URL}/get_transaksi.php`;
        
        const params = new URLSearchParams(filters);
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.data || [];
        } else {
            console.error('Error fetching data:', result.message);
            if (result.message.includes('Unauthorized')) {
                localStorage.clear();
                window.location.href = 'login.html';
            }
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal mengambil data. Pastikan server PHP berjalan.');
        return [];
    }
}

// Add Transaksi via API
async function addTransaksi(transaksi) {
    try {
        const response = await fetch(`${API_URL}/add_transaksi.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transaksi)
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            alert('Error: ' + result.message);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal menambah transaksi. Pastikan server PHP berjalan.');
        return null;
    }
}

// Delete Transaksi via API
async function deleteTransaksi(id) {
    try {
        const response = await fetch(`${API_URL}/delete_transaksi.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result;
        } else {
            alert('Error: ' + result.message);
            return { success: false, message: result.message };
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal menghapus transaksi. Pastikan server PHP berjalan.');
        return { success: false, message: error.message };
    }
}

// Get Summary via API
async function getSummary() {
    try {
        const response = await fetch(`${API_URL}/get_summary.php`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Error fetching summary:', result.message);
            return {
                totalPemasukan: 0,
                totalPengeluaran: 0,
                saldo: 0
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            totalPemasukan: 0,
            totalPengeluaran: 0,
            saldo: 0
        };
    }
}

// ========== FORMATTING FUNCTIONS ==========

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatTanggal(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function formatTanggalShort(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'short' });
    return `${day} ${month}`;
}

function capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// ========== CALCULATION FUNCTIONS ==========

async function calculateSummary() {
    return await getSummary();
}

// ========== UTILITY FUNCTIONS ==========

function getCurrentDate() {
    const today = new Date();
    return formatTanggal(today.toISOString().split('T')[0]);
}

function filterByDateRange(data, startDate, endDate) {
    return data.filter(t => {
        const date = new Date(t.tanggal);
        return date >= new Date(startDate) && date <= new Date(endDate);
    });
}

function groupByCategory(data) {
    const grouped = {};
    data.forEach(t => {
        if (!grouped[t.kategori]) {
            grouped[t.kategori] = [];
        }
        grouped[t.kategori].push(t);
    });
    return grouped;
}

function calculateByCategory(data, type = null) {
    const filtered = type ? data.filter(t => t.tipe === type) : data;
    const totals = {};
    
    filtered.forEach(t => {
        if (!totals[t.kategori]) {
            totals[t.kategori] = 0;
        }
        totals[t.kategori] += t.jumlah;
    });
    
    return totals;
}

// Clear All Data
async function clearAllData() {
    if (!confirm('⚠️ PERINGATAN!\n\nIni akan menghapus SEMUA data transaksi kamu dari database!\n\nYakin ingin melanjutkan?')) {
        return;
    }
    
    if (!confirm('Konfirmasi sekali lagi - Data tidak bisa dikembalikan!')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/clear_all.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ ${result.message}`);
            // Reload halaman
            window.location.reload();
        } else {
            alert('❌ Gagal menghapus data: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Terjadi kesalahan saat menghapus data');
    }
}

console.log('✅ Global.js (Export PDF Ready) loaded successfully');