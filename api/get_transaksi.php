<?php
// get_transaksi.php - Get all transactions for logged-in user

require_once 'config.php';

// Check if user is logged in
$user_id = $_SESSION['user_id'] ?? $_SESSION['id_user'] ?? null;

if (!$user_id) {
    sendResponse(false, 'Unauthorized - Please login first');
}

// Get filter parameters from query string
$tipe = isset($_GET['tipe']) ? validateInput($_GET['tipe']) : null;
$kategori = isset($_GET['kategori']) ? validateInput($_GET['kategori']) : null;
$startDate = isset($_GET['start_date']) ? validateInput($_GET['start_date']) : null;
$endDate = isset($_GET['end_date']) ? validateInput($_GET['end_date']) : null;

// Build query
$sql = "SELECT * FROM transaksi WHERE user_id = ?";
$params = [$user_id];
$types = "i";

if ($tipe) {
    $sql .= " AND tipe = ?";
    $params[] = $tipe;
    $types .= "s";
}

if ($kategori) {
    $sql .= " AND kategori = ?";
    $params[] = $kategori;
    $types .= "s";
}

if ($startDate) {
    $sql .= " AND tanggal >= ?";
    $params[] = $startDate;
    $types .= "s";
}

if ($endDate) {
    $sql .= " AND tanggal <= ?";
    $params[] = $endDate;
    $types .= "s";
}

$sql .= " ORDER BY tanggal DESC, created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$transaksi = [];
while ($row = $result->fetch_assoc()) {
    $transaksi[] = [
        'id' => (int)$row['id'],
        'tipe' => $row['tipe'],
        'kategori' => $row['kategori'],
        'jumlah' => (float)$row['jumlah'],
        'tanggal' => $row['tanggal'],
        'deskripsi' => $row['deskripsi'],
        'created_at' => $row['created_at']
    ];
}

sendResponse(true, 'Data retrieved successfully', $transaksi);
?>