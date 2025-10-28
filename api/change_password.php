<?php
// change_password.php - UPDATED VERSION

error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'config.php';

// Start session if not started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['id_user']) && !isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => "error", 
        "message" => "Anda belum login. Silakan login terlebih dahulu."
    ]);
    exit;
}

// Get user ID from session
$id_user = $_SESSION['id_user'] ?? $_SESSION['user_id'];

// Get JSON data
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($data['old_password']) || !isset($data['new_password'])) {
    echo json_encode([
        "status" => "error", 
        "message" => "Data tidak lengkap. Password lama dan baru harus diisi."
    ]);
    exit;
}

$old_password = trim($data['old_password']);
$new_password = trim($data['new_password']);

// Validate empty fields
if (empty($old_password) || empty($new_password)) {
    echo json_encode([
        "status" => "error", 
        "message" => "Password tidak boleh kosong"
    ]);
    exit;
}

// Validate new password length
if (strlen($new_password) < 6) {
    echo json_encode([
        "status" => "error", 
        "message" => "Password baru minimal 6 karakter"
    ]);
    exit;
}

// Get current password from database
$stmt = $conn->prepare("SELECT password, username FROM user WHERE id_user = ?");
$stmt->bind_param("i", $id_user);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error", 
        "message" => "User tidak ditemukan"
    ]);
    exit;
}

$user = $result->fetch_assoc();

// Verify old password
if (!password_verify($old_password, $user['password'])) {
    echo json_encode([
        "status" => "error", 
        "message" => "Password lama salah. Silakan coba lagi."
    ]);
    exit;
}

// Check if new password is same as old password
if (password_verify($new_password, $user['password'])) {
    echo json_encode([
        "status" => "error", 
        "message" => "Password baru tidak boleh sama dengan password lama"
    ]);
    exit;
}

// Hash new password
$new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

// Update password in database
$update_stmt = $conn->prepare("UPDATE user SET password = ? WHERE id_user = ?");
$update_stmt->bind_param("si", $new_password_hash, $id_user);

if ($update_stmt->execute()) {
    echo json_encode([
        "status" => "success", 
        "message" => "Password berhasil diubah",
        "data" => [
            "username" => $user['username'],
            "updated_at" => date('Y-m-d H:i:s')
        ]
    ]);
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Gagal mengubah password. Silakan coba lagi."
    ]);
}

// Close connections
$stmt->close();
$update_stmt->close();
$conn->close();
?>