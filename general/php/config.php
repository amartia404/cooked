<?php

$host = 'localhost';   
$db   = 'cookbook';    // название вашей базы в phpMyAdmin
$user = 'root';        // стандартный пользователь MySQL в XAMPP
$pass = '';            // в XAMPP по умолчанию пароль пустой
$charset = 'utf8mb4';  // <- добавьте это

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}