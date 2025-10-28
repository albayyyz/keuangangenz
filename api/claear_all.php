<?php
// api/clear_all.php - Clear All User Transactions

require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    sendResponse(false, 'Unauthorized - Please login first');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed');
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("DELETE FROM transaksi WHERE user_id = ?");
$stmt->bind_param("i", $user_id);

if ($stmt->execute()) {
    $deleted_count = $stmt->affected_rows;
    sendResponse(true, "Berhasil menghapus $deleted_count transaksi", [
        'deleted_count' => $deleted_count
    ]);
} else {
    sendResponse(false, 'Gagal menghapus data: ' . $conn->error);
}
?>