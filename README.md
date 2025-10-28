# 💰 Aplikasi Keuangan GenZ

Aplikasi manajemen keuangan personal berbasis web dengan fitur tracking pemasukan & pengeluaran, laporan visual, dan export PDF.

## 🌟 Fitur Utama

- ✅ **Login & Register** dengan sistem autentikasi
- 💳 **Manajemen Transaksi** (pemasukan & pengeluaran)
- 📊 **Dashboard Interaktif** dengan grafik real-time
- 📈 **Laporan Keuangan** dengan pie chart
- 📜 **Riwayat Transaksi** dengan filter & search
- 🔔 **Notifikasi Real-time**
- 👤 **Profile Management** dengan ubah password
- 📄 **Export PDF** laporan keuangan
- 🎨 **UI Modern** dengan gradient hijau tosca & pink

## 🛠️ Teknologi

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: PHP (Native)
- **Database**: MySQL
- **Library**: Chart.js, jsPDF

## 📋 Cara Install

### 1. Clone Repository
```bash
git clone https://github.com/username/keuangangenz.git
cd keuangangenz
```

### 2. Setup Database
- Buat database `keuangangenz` di phpMyAdmin
- Import file `database.sql` (jika ada)
- Atau biarkan auto-create saat pertama kali run

### 3. Konfigurasi Database
Edit `api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // Password MySQL Anda
define('DB_NAME', 'keuangangenz');
```

### 4. Jalankan XAMPP/Server
- Start Apache & MySQL
- Akses: `http://localhost/keuangangenz/pages/login.html`

## 🎮 Penggunaan

1. **Register** akun baru atau **Login** dengan akun existing
2. Tambah **transaksi** pemasukan/pengeluaran
3. Lihat **dashboard** untuk overview keuangan
4. Cek **laporan** untuk analisis per kategori
5. Export **PDF** untuk dokumentasi

## 📸 Screenshot

### Login Page
![Login](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Laporan
![Laporan](screenshots/laporan.png)

## 👨‍💻 Developer

- **Nama**: [Nama Anda]
- **Email**: [Email Anda]
- **GitHub**: [Username GitHub Anda]

## 📄 License

MIT License - Bebas digunakan untuk pembelajaran

## 🙏 Kontribusi

Pull requests welcome! Untuk perubahan besar, buka issue terlebih dahulu.

---

⭐ **Jangan lupa beri star jika project ini bermanfaat!**