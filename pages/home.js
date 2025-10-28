// home.js - Home Page with PHP API Integration

let pemasukanChart = null;
let pengeluaranChart = null;
let currentPeriod = 7;

// Initialize Home Page
document.addEventListener('DOMContentLoaded', async function() {
    await checkLogin();
    displayCurrentDate();
    await updateSummaryCards();
    await loadCharts(currentPeriod);
    await loadPengeluaranTable();
});

// Display Current Date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = getCurrentDate();
    }
}

// Update Summary Cards
async function updateSummaryCards() {
    const summary = await calculateSummary();
    
    const pemasukanEl = document.getElementById('totalPemasukan');
    const pengeluaranEl = document.getElementById('totalPengeluaran');
    const saldoEl = document.getElementById('saldo');
    
    if (pemasukanEl) pemasukanEl.textContent = formatRupiah(summary.totalPemasukan);
    if (pengeluaranEl) pengeluaranEl.textContent = formatRupiah(summary.totalPengeluaran);
    if (saldoEl) {
        saldoEl.textContent = formatRupiah(summary.saldo);
        saldoEl.style.color = summary.saldo >= 0 ? '#10b981' : '#ef4444';
    }
}

// Change Chart Period
async function changeChartPeriod(days) {
    currentPeriod = days;
    
    document.querySelectorAll('.btn-period').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    await loadCharts(days);
}

// Load Charts
async function loadCharts(days) {
    const data = await getTransaksiData();
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    
    const filteredData = data.filter(t => {
        const transaksiDate = new Date(t.tanggal);
        return transaksiDate >= startDate && transaksiDate <= today;
    });
    
    const dates = [];
    const pemasukanData = [];
    const pengeluaranData = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        dates.push(formatTanggalShort(dateStr));
        
        const dayTransaksi = filteredData.filter(t => t.tanggal === dateStr);
        const pemasukan = dayTransaksi
            .filter(t => t.tipe === 'pemasukan')
            .reduce((sum, t) => sum + parseFloat(t.jumlah), 0);
        const pengeluaran = dayTransaksi
            .filter(t => t.tipe === 'pengeluaran')
            .reduce((sum, t) => sum + parseFloat(t.jumlah), 0);
        
        pemasukanData.push(pemasukan);
        pengeluaranData.push(pengeluaran);
    }
    
    createChart('pemasukanChart', 'Pemasukan', dates, pemasukanData, '#10b981', 'pemasukan');
    createChart('pengeluaranChart', 'Pengeluaran', dates, pengeluaranData, '#ef4444', 'pengeluaran');
}

// Create Chart
function createChart(canvasId, label, labels, data, color, type) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (type === 'pemasukan' && pemasukanChart) {
        pemasukanChart.destroy();
    }
    if (type === 'pengeluaran' && pengeluaranChart) {
        pengeluaranChart.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatRupiah(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + (value / 1000) + 'k';
                        }
                    }
                }
            }
        }
    });
    
    if (type === 'pemasukan') {
        pemasukanChart = chart;
    } else {
        pengeluaranChart = chart;
    }
}

// Load Pengeluaran Table
async function loadPengeluaranTable() {
    const tbody = document.getElementById('pengeluaranTableBody');
    if (!tbody) return;
    
    const data = await getTransaksiData();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const pengeluaranBulanIni = data.filter(t => {
        const transaksiDate = new Date(t.tanggal);
        return t.tipe === 'pengeluaran' && 
               transaksiDate.getMonth() === currentMonth &&
               transaksiDate.getFullYear() === currentYear;
    });
    
    if (pengeluaranBulanIni.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Belum ada pengeluaran bulan ini</td></tr>';
        return;
    }
    
    pengeluaranBulanIni.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    const recentTransaksi = pengeluaranBulanIni.slice(0, 10);
    
    tbody.innerHTML = recentTransaksi.map(t => `
        <tr>
            <td>${formatTanggal(t.tanggal)}</td>
            <td>${capitalizeFirst(t.kategori)}</td>
            <td>${t.deskripsi}</td>
            <td class="expense">${formatRupiah(t.jumlah)}</td>
            <td>
                <button class="btn-delete" onclick="deleteFromHome(${t.id})">Hapus</button>
            </td>
        </tr>
    `).join('');
}

// Delete Transaction from Home
async function deleteFromHome(id) {
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
        const result = await deleteTransaksi(id);
        
        if (result.success) {
            await updateSummaryCards();
            await loadCharts(currentPeriod);
            await loadPengeluaranTable();
            alert('Transaksi berhasil dihapus!');
        } else {
            alert(result.message || 'Gagal menghapus transaksi');
        }
    }
}

console.log('Home.js loaded successfully');
// ✅ AUTO NOTIFICATION saat halaman dimuat
document.addEventListener('DOMContentLoaded', async function() {
    // ... kode existing ...
    
    // Check dan kirim notifikasi otomatis
    if (typeof monitorTransactions === 'function') {
        await monitorTransactions();
        console.log('✅ Auto notification check completed');
    }
});