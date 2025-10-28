// riwayat.js - Riwayat Transaksi (FIXED & ENHANCED)

let allTransaksi = [];
let filteredTransaksi = [];

// Initialize Riwayat Page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Initializing Riwayat page...');
    
    await checkLogin();
    
    // Show loading
    showLoading(true);
    
    await loadRiwayatTransaksi();
    
    // Hide loading
    showLoading(false);
});

// Show/Hide Loading
function showLoading(show) {
    const tbody = document.getElementById('riwayatTableBody');
    if (!tbody) return;
    
    if (show) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <div style="font-size: 2rem;">⏳</div>
                    <div style="margin-top: 10px; color: #666;">Memuat data...</div>
                </td>
            </tr>
        `;
    }
}

// Load Riwayat Transaksi
async function loadRiwayatTransaksi() {
    console.log('📥 Loading riwayat transaksi...');
    
    try {
        allTransaksi = await getTransaksiData();
        console.log('✅ Data loaded:', allTransaksi.length, 'transaksi');
        
        filteredTransaksi = [...allTransaksi];
        displayRiwayat(filteredTransaksi);
        updateStatistics();
    } catch (error) {
        console.error('❌ Error loading data:', error);
        const tbody = document.getElementById('riwayatTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #ef4444;">
                        <div style="font-size: 2rem;">❌</div>
                        <div style="margin-top: 10px;">Gagal memuat data: ${error.message}</div>
                        <button onclick="loadRiwayatTransaksi()" style="margin-top: 15px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            🔄 Coba Lagi
                        </button>
                    </td>
                </tr>
            `;
        }
    }
}

// Update Statistics
function updateStatistics() {
    const stats = {
        total: filteredTransaksi.length,
        pemasukan: filteredTransaksi.filter(t => t.tipe === 'pemasukan').length,
        pengeluaran: filteredTransaksi.filter(t => t.tipe === 'pengeluaran').length,
        totalPemasukan: filteredTransaksi
            .filter(t => t.tipe === 'pemasukan')
            .reduce((sum, t) => sum + parseFloat(t.jumlah), 0),
        totalPengeluaran: filteredTransaksi
            .filter(t => t.tipe === 'pengeluaran')
            .reduce((sum, t) => sum + parseFloat(t.jumlah), 0)
    };
    
    // Update or create statistics display
    let statsDiv = document.getElementById('riwayatStats');
    if (!statsDiv) {
        statsDiv = document.createElement('div');
        statsDiv.id = 'riwayatStats';
        statsDiv.className = 'riwayat-stats';
        
        const filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            filterSection.parentNode.insertBefore(statsDiv, filterSection.nextSibling);
        }
    }
    
    statsDiv.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
                <div class="stat-label">Total Transaksi</div>
                <div class="stat-value">${stats.total}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
                <div class="stat-label">Pemasukan (${stats.pemasukan}x)</div>
                <div class="stat-value income">${formatRupiah(stats.totalPemasukan)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">💸</div>
            <div class="stat-content">
                <div class="stat-label">Pengeluaran (${stats.pengeluaran}x)</div>
                <div class="stat-value expense">${formatRupiah(stats.totalPengeluaran)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">💵</div>
            <div class="stat-content">
                <div class="stat-label">Saldo</div>
                <div class="stat-value ${stats.totalPemasukan - stats.totalPengeluaran >= 0 ? 'income' : 'expense'}">
                    ${formatRupiah(stats.totalPemasukan - stats.totalPengeluaran)}
                </div>
            </div>
        </div>
    `;
}

// Display Riwayat
function displayRiwayat(data) {
    const tbody = document.getElementById('riwayatTableBody');
    if (!tbody) {
        console.error('❌ Table body not found!');
        return;
    }
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📭</div>
                    <div style="font-size: 1.2rem; color: #666; margin-bottom: 10px;">
                        Tidak ada transaksi ditemukan
                    </div>
                    <div style="color: #999; font-size: 0.9rem;">
                        ${allTransaksi.length > 0 ? 'Coba ubah filter pencarian' : 'Mulai tambahkan transaksi pertama Anda'}
                    </div>
                    ${allTransaksi.length === 0 ? `
                        <a href="transaksi.html" class="btn-add" style="margin-top: 20px; display: inline-block;">
                            + Tambah Transaksi
                        </a>
                    ` : ''}
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date descending (newest first)
    data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    console.log('📊 Displaying', data.length, 'transaksi');
    
    tbody.innerHTML = data.map((t, index) => `
        <tr style="animation: fadeIn 0.3s ease ${index * 0.05}s both;">
            <td>
                <div style="font-weight: 600;">${formatTanggal(t.tanggal)}</div>
                <div style="font-size: 0.85rem; color: #999;">${formatTanggalShort(t.tanggal)}</div>
            </td>
            <td>
                <span class="badge ${t.tipe}">${capitalizeFirst(t.tipe)}</span>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.2rem;">${getKategoriIcon(t.kategori)}</span>
                    <span style="font-weight: 500;">${capitalizeFirst(t.kategori)}</span>
                </div>
            </td>
            <td>
                <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${t.deskripsi || '-'}">
                    ${t.deskripsi || '<span style="color: #ccc;">-</span>'}
                </div>
            </td>
            <td class="${t.tipe === 'pemasukan' ? 'income' : 'expense'}" style="font-weight: 700; font-size: 1.05rem;">
                ${t.tipe === 'pemasukan' ? '+' : '-'} ${formatRupiah(t.jumlah)}
            </td>
            <td>
                <button class="btn-delete" onclick="deleteRiwayat(${t.id})" title="Hapus transaksi">
                    🗑️ Hapus
                </button>
            </td>
        </tr>
    `).join('');
}

// Get Kategori Icon
function getKategoriIcon(kategori) {
    const icons = {
        'gaji': '💼',
        'bonus': '🎁',
        'investasi': '📈',
        'makanan': '🍔',
        'transport': '🚗',
        'belanja': '🛒',
        'hiburan': '🎮',
        'tagihan': '📄',
        'kesehatan': '🏥',
        'lainnya': '📦'
    };
    return icons[kategori.toLowerCase()] || '📦';
}

// Search Transaksi
function searchTransaksi() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const tipeFilter = document.getElementById('filterTipe').value;
    
    console.log('🔍 Searching with:', { searchTerm, tipeFilter });
    
    filteredTransaksi = allTransaksi.filter(t => {
        const matchSearch = 
            t.kategori.toLowerCase().includes(searchTerm) ||
            (t.deskripsi && t.deskripsi.toLowerCase().includes(searchTerm)) ||
            t.tanggal.includes(searchTerm) ||
            formatRupiah(t.jumlah).toLowerCase().includes(searchTerm);
        
        const matchTipe = !tipeFilter || t.tipe === tipeFilter;
        
        return matchSearch && matchTipe;
    });
    
    console.log('✅ Found', filteredTransaksi.length, 'results');
    
    displayRiwayat(filteredTransaksi);
    updateStatistics();
}

// Filter Transaksi
function filterTransaksi() {
    searchTransaksi();
}

// Delete Riwayat
async function deleteRiwayat(id) {
    const transaksi = allTransaksi.find(t => t.id === id);
    
    if (!transaksi) {
        alert('❌ Transaksi tidak ditemukan');
        return;
    }
    
    const confirmMsg = `Yakin ingin menghapus transaksi ini?\n\n` +
                      `Tipe: ${capitalizeFirst(transaksi.tipe)}\n` +
                      `Kategori: ${capitalizeFirst(transaksi.kategori)}\n` +
                      `Jumlah: ${formatRupiah(transaksi.jumlah)}\n` +
                      `Tanggal: ${formatTanggal(transaksi.tanggal)}`;
    
    if (confirm(confirmMsg)) {
        console.log('🗑️ Deleting transaksi:', id);
        
        // Show loading on the delete button
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '⏳';
        
        const result = await deleteTransaksi(id);
        
        if (result.success) {
            console.log('✅ Transaksi deleted successfully');
            
            // Show success animation
            showSuccessToast('✅ Transaksi berhasil dihapus!');
            
            // ✅ Kirim notifikasi
            if (typeof addNotification === 'function') {
                addNotification(
                    'info',
                    '🗑️ Transaksi Dihapus',
                    `${capitalizeFirst(transaksi.kategori)}: ${formatRupiah(transaksi.jumlah)}`
                );
            }
            
            // Reload data
            await loadRiwayatTransaksi();
        } else {
            console.error('❌ Failed to delete:', result.message);
            alert('❌ ' + (result.message || 'Gagal menghapus transaksi'));
            
            // Restore button
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

// Show Success Toast
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Add animations (only once!)
if (!document.getElementById('riwayatAnimations')) {
    const animationStyle = document.createElement('style');
    animationStyle.id = 'riwayatAnimations';
    animationStyle.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(animationStyle);
}

// ✅ Attach functions to window for debugging and global access
if (typeof window !== 'undefined') {
    window.loadRiwayatTransaksi = loadRiwayatTransaksi;
    window.searchTransaksi = searchTransaksi;
    window.filterTransaksi = filterTransaksi;
    window.deleteRiwayat = deleteRiwayat;
    console.log('✅ Riwayat functions attached to window object');
}

console.log('✅ Riwayat.js (FIXED & ENHANCED) loaded successfully');