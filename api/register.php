<?php
// File: API/register.php
header("Content-Type: application/json");
include 'config.php'; // koneksi ke database

// Terima data dari frontend (JSON)
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username'], $data['password'], $data['nama_lengkap'])) {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
    exit;
}

$username = trim($data['username']);
$password = trim($data['password']);
$nama = trim($data['nama_lengkap']);

// Validasi input dasar
if (empty($username) || empty($password) || empty($nama)) {
    echo json_encode(["status" => "error", "message" => "Semua field harus diisi"]);
    exit;
}

// Cek apakah username sudah terdaftar
$stmt = $conn->prepare("SELECT * FROM user WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Username sudah digunakan"]);
    exit;
}

// Hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Simpan data user baru
$stmt = $conn->prepare("INSERT INTO user (username, password, nama_lengkap, created_at) VALUES (?, ?, ?, NOW())");
$stmt->bind_param("sss", $username, $hashed_password, $nama);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Pendaftaran berhasil"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal menyimpan data"]);
}

$stmt->close();
$conn->close();
?>
