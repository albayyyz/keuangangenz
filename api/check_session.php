<?php
session_start();
header("Content-Type: application/json");

if (isset($_SESSION['id_user'])) {
    echo json_encode([
        "status" => "logged_in",
        "user" => [
            "id_user" => $_SESSION['id_user'],
            "username" => $_SESSION['username'],
            "nama_lengkap" => $_SESSION['nama_lengkap']
        ]
    ]);
} else {
    echo json_encode(["status" => "not_logged_in"]);
}
?>
