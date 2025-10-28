// laporan.js - UPDATED VERSION dengan Pie Chart

let kategoriChartInstance = null;

// Initialize Laporan Page
document.addEventListener('DOMContentLoaded', async function() {
    await checkLogin();

    // Set bulan saat ini sebagai default
    setCurrentMonth();

    // Generate laporan otomatis
    await generateLaporan();
});

// Set Current Month
function setCurrentMonth() {
    const select = document.getElementById('filterBulan');
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    // Cek apakah option bulan ini ada
    const option = select.querySelector(`option[value="${currentMonth}"]`);
    if (option) {
        select.value = currentMonth;
    }
}

// Generate Laporan
async function generateLaporan() {
    console.log('📄 Generating laporan...');

    // Ambil data fresh dari API
    const data = await getTransaksiData();
    console.log('📊 Total transaksi dari API:', data.length);

    const bulan = document.getElementById('filterBulan').value;
    const tahun = new Date().getFullYear();

    console.log('🗓️ Filter bulan:', bulan, 'tahun:', tahun);

    // Filter berdasarkan bulan dan tahun
    const filteredData = data.filter(t => {
        const transaksiDate = new Date(t.tanggal);
        const transaksiMonth = String(transaksiDate.getMonth() + 1).padStart(2, '0');
        const transaksiYear = transaksiDate.getFullYear();

        const match = transaksiMonth === bulan && transaksiYear === tahun;

        if (match) {
            console.log('✅ Match:', t.tanggal, t.kategori, t.jumlah);
        }

        return match;
    });

    console.log('📋 Transaksi bulan ini:', filteredData.length);

    // Hitung total pemasukan
    const totalPemasukan = filteredData
        .filter(t => t.tipe === 'pemasukan')
        .reduce((sum, t) => sum + parseFloat(t.jumlah), 0);

    // Hitung total pengeluaran
    const totalPengeluaran = filteredData
        .filter(t => t.tipe === 'pengeluaran')
        .reduce((sum, t) => sum + parseFloat(t.jumlah), 0);

    const selisih = totalPemasukan - totalPengeluaran;

    console.log('💰 Total Pemasukan:', totalPemasukan);
    console.log('💸 Total Pengeluaran:', totalPengeluaran);
    console.log('💵 Selisih:', selisih);

    // Update tampilan summary
    document.getElementById('laporanPemasukan').textContent = formatRupiah(totalPemasukan);
    document.getElementById('laporanPengeluaran').textContent = formatRupiah(totalPengeluaran);
    document.getElementById('laporanSelisih').textContent = formatRupiah(selisih);

    const selisihElement = document.getElementById('laporanSelisih');
    if (selisih >= 0) {
        selisihElement.classList.remove('expense');
        selisihElement.classList.add('income');
    } else {
        selisihElement.classList.remove('income');
        selisihElement.classList.add('expense');
    }

    // Buat chart dan detail
    createKategoriPieChart(filteredData);
    createKategoriDetail(filteredData);
}

// ✅ NEW: Create Kategori Pie Chart
function createKategoriPieChart(data) {
    const pengeluaran = data.filter(t => t.tipe === 'pengeluaran');

    const canvas = document.getElementById('kategoriChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Hancurkan instance lama jika ada
    if (kategoriChartInstance) {
        try { kategoriChartInstance.destroy(); } catch (e) { /* ignore */ }
        kategoriChartInstance = null;
    }

    if (!pengeluaran || pengeluaran.length === 0) {
        // Tampilkan pesan "Tidak ada data"
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('Tidak ada data pengeluaran untuk bulan ini', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Kelompokkan pengeluaran per kategori
    const kategoriData = {};
    pengeluaran.forEach(t => {
        const k = t.kategori || 'lainnya';
        if (!kategoriData[k]) kategoriData[k] = 0;
        kategoriData[k] += parseFloat(t.jumlah) || 0;
    });

    // Urutkan berdasarkan nilai (terbesar ke terkecil)
    const sortedKategori = Object.entries(kategoriData).sort((a, b) => b[1] - a[1]);
    const labels = sortedKategori.map(([k]) => capitalizeFirst(k));
    const values = sortedKategori.map(([, v]) => v);

    // Warna gradasi hijau tosca ke pink
    const colors = [
        'rgba(74, 222, 128, 0.9)',   // Hijau tosca
        'rgba(34, 197, 94, 0.9)',    // Hijau
        'rgba(134, 239, 172, 0.9)',  // Hijau muda
        'rgba(252, 231, 243, 0.9)',  // Pink muda
        'rgba(249, 168, 212, 0.9)',  // Pink sedang
        'rgba(236, 72, 153, 0.9)',   // Pink
        'rgba(219, 39, 119, 0.9)',   // Pink tua
        'rgba(190, 24, 93, 0.9)',    // Pink sangat tua
        'rgba(157, 23, 77, 0.9)',    // Merah keunguan
        'rgba(131, 24, 67, 0.9)'     // Merah tua
    ];

    // Border colors (versi lebih gelap)
    const borderColors = [
        'rgba(74, 222, 128, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(134, 239, 172, 1)',
        'rgba(252, 231, 243, 1)',
        'rgba(249, 168, 212, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(219, 39, 119, 1)',
        'rgba(190, 24, 93, 1)',
        'rgba(157, 23, 77, 1)',
        'rgba(131, 24, 67, 1)'
    ];

    // Buat Doughnut Chart (Pie Chart dengan lubang di tengah)
    kategoriChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pengeluaran',
                data: values,
                backgroundColor: colors.slice(0, values.length),
                borderColor: borderColors.slice(0, values.length),
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#333',
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatRupiah(value)} (${percentage}%)`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: '📊 Komposisi Pengeluaran per Kategori',
                    font: { size: 16, weight: 'bold' },
                    color: '#333',
                    padding: { top: 10, bottom: 20 }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    console.log('✅ Pie chart created with', values.length, 'categories');
}

// Create Kategori Detail Table
function createKategoriDetail(data) {
    const pengeluaran = data.filter(t => t.tipe === 'pengeluaran');

    // Cari atau buat container untuk detail
    let detailContainer = document.getElementById('kategoriDetail');

    if (!detailContainer) {
        detailContainer = document.createElement('div');
        detailContainer.id = 'kategoriDetail';
        detailContainer.className = 'kategori-detail';

        const kategoriSection = document.querySelector('.kategori-section');
        if (kategoriSection) kategoriSection.appendChild(detailContainer);
    }

    if (!pengeluaran || pengeluaran.length === 0) {
        detailContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #999;">
                <p>Tidak ada data pengeluaran untuk ditampilkan</p>
            </div>
        `;
        return;
    }

    // Group by kategori
    const kategoriData = {};
    pengeluaran.forEach(t => {
        const k = t.kategori || 'lainnya';
        if (!kategoriData[k]) {
            kategoriData[k] = { total: 0, transaksi: [] };
        }
        kategoriData[k].total += parseFloat(t.jumlah) || 0;
        kategoriData[k].transaksi.push(t);
    });

    // Sort by total descending
    const sortedKategori = Object.entries(kategoriData)
        .sort((a, b) => b[1].total - a[1].total);

    const totalPengeluaran = sortedKategori.reduce((sum, [, data]) => sum + data.total, 0);

    // Build HTML
    let html = `
        <div style="margin-top: 30px;">
            <h3 style="color: #333; margin-bottom: 20px; font-size: 1.1rem;">
                📊 Detail Pengeluaran per Kategori
            </h3>
    `;

    // Top 3 Kategori Terbesar
    html += `
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #f59e0b;">
            <h4 style="margin: 0 0 15px 0; color: #92400e; font-size: 1rem;">
                🏆 Top 3 Pengeluaran Terbesar
            </h4>
    `;

    for (let i = 0; i < Math.min(3, sortedKategori.length); i++) {
        const [kategori, data] = sortedKategori[i];
        const percentage = ((data.total / totalPengeluaran) * 100).toFixed(1);
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';

        html += `
            <div style="margin-bottom: 10px; padding: 12px; background: white; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #333;">
                        ${medal} ${capitalizeFirst(kategori)}
                    </span>
                    <span style="font-weight: 700; color: #ef4444; font-size: 1.1rem;">
                        ${formatRupiah(data.total)}
                    </span>
                </div>
                <div style="margin-top: 5px; font-size: 0.9rem; color: #666;">
                    ${percentage}% dari total pengeluaran • ${data.transaksi.length} transaksi
                </div>
            </div>
        `;
    }

    html += `</div>`;

    // Tabel Detail Semua Kategori
    html += `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: #f9fafb;">
                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #e5e7eb;">Kategori</th>
                        <th style="padding: 12px; text-align: right; font-weight: 600; color: #333; border-bottom: 2px solid #e5e7eb;">Jumlah</th>
                        <th style="padding: 12px; text-align: center; font-weight: 600; color: #333; border-bottom: 2px solid #e5e7eb;">Transaksi</th>
                        <th style="padding: 12px; text-align: right; font-weight: 600; color: #333; border-bottom: 2px solid #e5e7eb;">Persentase</th>
                    </tr>
                </thead>
                <tbody>
    `;

    sortedKategori.forEach(([kategori, data], index) => {
        const percentage = ((data.total / totalPengeluaran) * 100).toFixed(1);
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';

        html += `
            <tr style="background: ${bgColor};">
                <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;"><strong>${capitalizeFirst(kategori)}</strong></td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #ef4444;">${formatRupiah(data.total)}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f3f4f6;">
                    <span style="background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem;">
                        ${data.transaksi.length}x
                    </span>
                </td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
                        <div style="width: 80px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #4ade80 0%, #ec4899 100%);"></div>
                        </div>
                        <span style="font-weight: 600; color: #666; min-width: 45px;">${percentage}%</span>
                    </div>
                </td>
            </tr>
        `;
    });

    // Total row
    html += `
            <tr style="background: #f3f4f6; font-weight: 700;">
                <td style="padding: 15px; border-top: 2px solid #d1d5db;">TOTAL</td>
                <td style="padding: 15px; text-align: right; color: #ef4444; border-top: 2px solid #d1d5db; font-size: 1.1rem;">${formatRupiah(totalPengeluaran)}</td>
                <td style="padding: 15px; text-align: center; border-top: 2px solid #d1d5db;">${pengeluaran.length}x</td>
                <td style="padding: 15px; text-align: right; border-top: 2px solid #d1d5db;">100%</td>
            </tr>
                </tbody>
            </table>
        </div>
    </div>
    `;

    detailContainer.innerHTML = html;
}

console.log('✅ Laporan.js (PIE CHART VERSION) loaded successfully');