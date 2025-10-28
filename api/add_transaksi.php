<?php
// add_transaksi.php - Fixed version

require_once 'config.php';

// Check if user is logged in (support both session keys)
$user_id = $_SESSION['user_id'] ?? $_SESSION['id_user'] ?? null;

if (!$user_id) {
    sendResponse(false, 'Unauthorized - Please login first');
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed');
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['tipe']) || !isset($input['kategori']) || 
    !isset($input['jumlah']) || !isset($input['tanggal'])) {
    sendResponse(false, 'Semua field wajib diisi');
}

$tipe = validateInput($input['tipe']);
$kategori = validateInput($input['kategori']);
$jumlah = floatval($input['jumlah']);
$tanggal = validateInput($input['tanggal']);
$deskripsi = isset($input['deskripsi']) ? validateInput($input['deskripsi']) : '';

// Validate tipe
if (!in_array($tipe, ['pemasukan', 'pengeluaran'])) {
    sendResponse(false, 'Tipe transaksi tidak valid');
}

// Validate jumlah
if ($jumlah <= 0) {
    sendResponse(false, 'Jumlah harus lebih dari 0');
}

// Insert to database
$stmt = $conn->prepare("INSERT INTO transaksi (user_id, tipe, kategori, jumlah, tanggal, deskripsi) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("issdss", $user_id, $tipe, $kategori, $jumlah, $tanggal, $deskripsi);

if ($stmt->execute()) {
    $transaksi_id = $conn->insert_id;
    
    sendResponse(true, 'Transaksi berhasil ditambahkan', [
        'id' => $transaksi_id,
        'tipe' => $tipe,
        'kategori' => $kategori,
        'jumlah' => $jumlah,
        'tanggal' => $tanggal,
        'deskripsi' => $deskripsi,
        'success' => true
    ]);
} else {
    sendResponse(false, 'Gagal menambahkan transaksi: ' . $conn->error);
}
?>