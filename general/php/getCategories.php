<?php
error_reporting(E_ALL);  // Включает все ошибки в логи (не в вывод)
ini_set('display_errors', 0);  // Отключает вывод ошибок напрямую
ini_set('log_errors', 1);  // Логирует в error_log
ini_set('error_log', 'php_errors.log');  // Файл логов (или используйте системный)

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // Или ограничьте домен для безопасности

// Подключение к БД (замените на свои credentials)
$host = 'localhost';
$db   = 'cookbook';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$result = $conn->query("SELECT key_name AS `key`, label FROM categories");
$categories = [];
while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode(['success' => true, 'categories' => $categories]);
$conn->close();
?>
