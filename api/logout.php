<?php
session_start();
header("Content-Type: application/json");

session_unset();   // hapus semua variabel session
session_destroy(); // hancurkan sesi

echo json_encode([
    "status" => "success",
    "message" => "Berhasil logout"
]);
?>

