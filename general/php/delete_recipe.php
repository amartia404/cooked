<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/tmp/delete_recipe_error.log'); // Замените на реальный путь логов

// Проверка на админа
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'error' => 'Только администратор может удалять рецепты']);
    exit;
}

// Подключение к БД (твой код подключения)
$host = 'localhost';
$dbname = 'cookbook';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Не удалось подключиться к БД: ' . $e->getMessage()]);
    exit;
}

$id = intval($_POST['id'] ?? 0);

if (!$id) {
    echo json_encode(['success' => false, 'error' => 'ID рецепта обязателен']);
    exit;
}

// Удалить рецепт из БД
try {
    $stmt = $pdo->prepare("DELETE FROM recipes WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Рецепт удалён']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка удаления']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка БД: ' . $e->getMessage()]);
}
exit;
?>
