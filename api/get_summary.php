<?php
// get_summary.php - Get financial summary for logged-in user

require_once 'config.php';

// Check if user is logged in
$user_id = $_SESSION['user_id'] ?? $_SESSION['id_user'] ?? null;

if (!$user_id) {
    sendResponse(false, 'Unauthorized - Please login first');
}

// Get total pemasukan
$stmt = $conn->prepare("SELECT COALESCE(SUM(jumlah), 0) as total FROM transaksi WHERE user_id = ? AND tipe = 'pemasukan'");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$totalPemasukan = $result->fetch_assoc()['total'];

// Get total pengeluaran
$stmt = $conn->prepare("SELECT COALESCE(SUM(jumlah), 0) as total FROM transaksi WHERE user_id = ? AND tipe = 'pengeluaran'");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$totalPengeluaran = $result->fetch_assoc()['total'];

// Calculate saldo
$saldo = $totalPemasukan - $totalPengeluaran;

sendResponse(true, 'Summary retrieved successfully', [
    'totalPemasukan' => (float)$totalPemasukan,
    'totalPengeluaran' => (float)$totalPengeluaran,
    'saldo' => (float)$saldo
]);
?>