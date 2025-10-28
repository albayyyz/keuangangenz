<?php
// login.php - Fixed version
error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'config.php';

// Start session jika belum
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Ambil data dari frontend (JSON)
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username'], $data['password'])) {
    echo json_encode([
        "status" => "error", 
        "message" => "Data login tidak lengkap"
    ]);
    exit;
}

$username = trim($data['username']);
$password = trim($data['password']);

// Validasi input
if (empty($username) || empty($password)) {
    echo json_encode([
        "status" => "error", 
        "message" => "Username dan password wajib diisi"
    ]);
    exit;
}

// Ambil data user berdasarkan username
$stmt = $conn->prepare("SELECT id_user, username, password, nama_lengkap FROM user WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error", 
        "message" => "Username tidak ditemukan"
    ]);
    exit;
}

$user = $result->fetch_assoc();

// Verifikasi password
if (!password_verify($password, $user['password'])) {
    echo json_encode([
        "status" => "error", 
        "message" => "Password salah"
    ]);
    exit;
}

// Simpan session
$_SESSION['id_user'] = $user['id_user'];
$_SESSION['user_id'] = $user['id_user'];
$_SESSION['username'] = $user['username'];
$_SESSION['nama_lengkap'] = $user['nama_lengkap'];

echo json_encode([
    "status" => "success",
    "message" => "Login berhasil",
    "user" => [
        "id_user" => $user['id_user'],
        "username" => $user['username'],
        "nama_lengkap" => $user['nama_lengkap']
    ]
]);

$stmt->close();
$conn->close();
?>