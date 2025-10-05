<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Для отладки
if (isset($_GET['debug'])) {
    echo json_encode([
        'session_id' => session_id(),
        'user_id' => $_SESSION['user_id'] ?? 'NOT SET',
        'body' => $_POST,
        'server' => $_SERVER['REQUEST_METHOD'],
        'files' => $_FILES  // Для проверки загрузки
    ]);
    exit;
}

// Если пользователь не авторизован — вернуть ошибку JSON
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Не авторизован. Войдите в систему.']);
    exit;
}

// Подключение к БД с utf8mb4
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
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Не удалось подключиться к БД: ' . $e->getMessage()]);
    exit;
}

// Установить заголовок для JSON-ответа
header('Content-Type: application/json; charset=utf-8');

// Обработка только POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Метод запроса не поддерживается']);
    exit;
}

ob_clean();  // Очистка буфера

// Подготовка и валидация данных
$title = trim($_POST['title'] ?? '');
$cook_time = intval($_POST['cook_time'] ?? 0);
$category = trim($_POST['category'] ?? '');
$ingredientsRaw = $_POST['ingredients'] ?? [];
$stepsRaw = $_POST['steps'] ?? [];

// Декодировать HTML-сущности (на всякий случай)
$ingredientsRaw = array_map('htmlspecialchars_decode', $ingredientsRaw);
$stepsRaw = array_map('htmlspecialchars_decode', $stepsRaw);

// Закодировать в JSON без экранирования
$ingredients = json_encode($ingredientsRaw, JSON_UNESCAPED_UNICODE);
$steps = json_encode($stepsRaw, JSON_UNESCAPED_UNICODE);

// Проверка: ingredients и steps должны быть непустыми массивами
if (empty($ingredientsRaw) || empty($stepsRaw)) {
    echo json_encode(['success' => false, 'error' => 'Игредиенты и шаги не могут быть пустыми!']);
    exit;
}

$image_path = '';

// Основная валидация
if (empty($title) || empty($category) || $cook_time <= 0) {
    echo json_encode(['success' => false, 'error' => 'Заполните все обязательные поля (название, категория, время)!']);
    exit;
}

// Обработка загрузки фото
if (!empty($_FILES['imageFile']['name'])) {
    $upload_dir = __DIR__ . '/uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    $filename = uniqid('recipe_') . '_' . basename($_FILES['imageFile']['name']);
    $image_path = 'php/uploads/' . $filename;
    $target_file = $upload_dir . $filename;

    if (!move_uploaded_file($_FILES['imageFile']['tmp_name'], $target_file)) {
        echo json_encode(['success' => false, 'error' => 'Ошибка загрузки фото: ' . $_FILES['imageFile']['error']]);
        exit;
    }
}

// Сохранить в БД
try {
    $stmt = $pdo->prepare("INSERT INTO recipes (title, cook_time, category, ingredients, steps, image_path, user_id) VALUES (:title, :cook_time, :category, :ingredients, :steps, :image_path, :user_id)");
    $stmt->bindParam(':title', $title, PDO::PARAM_STR);
    $stmt->bindParam(':cook_time', $cook_time, PDO::PARAM_INT);
    $stmt->bindParam(':category', $category, PDO::PARAM_STR);
    $stmt->bindParam(':ingredients', $ingredients, PDO::PARAM_STR);  // Сохраняем JSON-строку без экранирования
    $stmt->bindParam(':steps', $steps, PDO::PARAM_STR);
    $stmt->bindParam(':image_path', $image_path, PDO::PARAM_STR);
    $stmt->bindParam(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Рецепт добавлен успешно!', 'recipe_id' => $pdo->lastInsertId()]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка сохранения в базу данных.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка БД: ' . $e->getMessage()]);
}
exit;
?>
