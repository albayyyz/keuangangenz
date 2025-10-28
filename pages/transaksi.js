// transaksi.js - Transaksi Page

// Initialize Transaksi Page
document.addEventListener('DOMContentLoaded', async function() {
    await checkLogin();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal').value = today;
    
    // Setup form submission
    const form = document.getElementById('transaksiForm');
    if (form) {
        form.addEventListener('submit', handleTransaksiSubmit);
    }
});

// Handle Form Submit
async function handleTransaksiSubmit(event) {
    event.preventDefault();
    
    const tipe = document.getElementById('tipeTransaksi').value;
    const kategori = document.getElementById('kategori').value;
    const jumlah = parseFloat(document.getElementById('jumlah').value);
    const tanggal = document.getElementById('tanggal').value;
    const deskripsi = document.getElementById('deskripsi').value.trim();
    
    // Validate inputs
    if (!tipe || !kategori || !jumlah || !tanggal) {
        alert('Semua field wajib diisi!');
        return;
    }
    
    if (jumlah <= 0) {
        alert('Jumlah harus lebih dari 0!');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';
    }
    
    // Prepare data
    const transaksi = {
        tipe: tipe,
        kategori: kategori,
        jumlah: jumlah,
        tanggal: tanggal,
        deskripsi: deskripsi
    };
    
    // Send to API
    const result = await addTransaksi(transaksi);
    
     if (result) {
        alert('✅ Transaksi berhasil ditambahkan!');
        
        // ✅ Kirim notifikasi
        if (typeof addNotification === 'function') {
            const tipeIcon = tipe === 'pemasukan' ? '💰' : '💸';
            addNotification(
                'success',
                `${tipeIcon} Transaksi ${capitalizeFirst(tipe)}`,
                `${capitalizeFirst(kategori)}: ${formatRupiah(jumlah)}`
            );
        }
        
        // Reset form
        document.getElementById('transaksiForm').reset();
        document.getElementById('tanggal').value = new Date().toISOString().split('T')[0];
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 500);
    }
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan Transaksi';
    }
}

console.log('Transaksi.js loaded successfully');