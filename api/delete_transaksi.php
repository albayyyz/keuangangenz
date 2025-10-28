<?php
// delete_transaksi.php - Delete transaction

require_once 'config.php';

// Check if user is logged in
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
if (!isset($input['id'])) {
    sendResponse(false, 'ID transaksi wajib diisi');
}

$id = intval($input['id']);

// Verify that the transaction belongs to the logged-in user
$stmt = $conn->prepare("SELECT id FROM transaksi WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, 'Transaksi tidak ditemukan atau Anda tidak memiliki akses');
}

// Delete transaction
$stmt = $conn->prepare("DELETE FROM transaksi WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $user_id);

if ($stmt->execute()) {
    sendResponse(true, 'Transaksi berhasil dihapus', ['id' => $id]);
} else {
    sendResponse(false, 'Gagal menghapus transaksi: ' . $conn->error);
}
?>