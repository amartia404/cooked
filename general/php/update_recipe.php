<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
//ini_set('error_log', '/tmp/update_recipe_error.log'); // Замените на реальный путь логов

// Проверка на админа
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'error' => 'Только администратор может редактировать рецепты']);
    exit;
}

// Подключение к БД
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

// Получение данных
$id = intval($_POST['id'] ?? 0);
$title = trim($_POST['title'] ?? '');
$cook_time = intval($_POST['cook_time'] ?? 0);
$category = trim($_POST['category'] ?? '');
$status = trim($_POST['status'] ?? 'approved');

// Получить ingredients и steps из POST (массивы)
$ingredientsRaw = $_POST['ingredients'] ?? [];
$stepsRaw = $_POST['steps'] ?? [];

// Преобразовать в строку JSON
$ingredients = json_encode(array_map('htmlspecialchars_decode', $ingredientsRaw), JSON_UNESCAPED_UNICODE);
$steps = json_encode(array_map('htmlspecialchars_decode', $stepsRaw), JSON_UNESCAPED_UNICODE);

// Валидация основных полей
if (!$id || empty($title) || empty($category) || $cook_time <= 0 || empty($ingredientsRaw) || empty($stepsRaw)) {
    echo json_encode(['success' => false, 'error' => 'Все поля обязательны']);
    exit;
}

// Получить текущий рецепт для старого image_path
$stmt = $pdo->prepare("SELECT image_path FROM recipes WHERE id = ?");
$stmt->execute([$id]);
$currentRecipe = $stmt->fetch();
if (!$currentRecipe) {
    echo json_encode(['success' => false, 'error' => 'Рецепт не найден']);
    exit;
}

$imagePath = $currentRecipe['image_path']; // По умолчанию старый

// Обработка нового изображения (если загружено)
if (!empty($_FILES['imageFile']['name'])) {
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
    $ext = strtolower(pathinfo($_FILES['imageFile']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExts)) {
        echo json_encode(['success' => false, 'error' => 'Недопустимый тип файла. Разрешены: jpg, jpeg, png, gif']);
        exit;
    }

    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($_FILES['imageFile']['size'] > $maxSize) {
        echo json_encode(['success' => false, 'error' => 'Файл слишком большой. Максимум 5MB']);
        exit;
    }

    if ($_FILES['imageFile']['error'] !== UPLOAD_ERR_OK) {
        $errorMsg = 'Ошибка загрузки файла';
        switch ($_FILES['imageFile']['error']) {
            case UPLOAD_ERR_INI_SIZE: $errorMsg = 'Превышен размер файла сервера'; break;
            case UPLOAD_ERR_PARTIAL: $errorMsg = 'Файл загружен частично'; break;
            case UPLOAD_ERR_NO_FILE: $errorMsg = 'Файл не загружен'; break;
        }
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        exit;
    }

    // Папка uploads/ в php/ (относительно корня сайта)
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    if (!is_writable($uploadDir)) {
        echo json_encode(['success' => false, 'error' => 'Папка загрузки недоступна для записи']);
        exit;
    }

    $filename = uniqid('recipe_', true) . '.' . $ext;
    $targetFile = $uploadDir . $filename;
    if (!move_uploaded_file($_FILES['imageFile']['tmp_name'], $targetFile)) {
        echo json_encode(['success' => false, 'error' => 'Не удалось сохранить изображение']);
        exit;
    }

    // Удалить старое изображение, если есть
    if (!empty($currentRecipe['image_path'])) {
        $oldFile = $uploadDir . basename($currentRecipe['image_path']);
        if (file_exists($oldFile)) {
            unlink($oldFile);
        }
    }

    $imagePath = 'php/uploads/' . $filename; // Новый путь (корректировка для вашего сайта)
}

// Обновить рецепт в БД
try {
    $stmt = $pdo->prepare("UPDATE recipes SET title = :title, cook_time = :cook_time, category = :category, ingredients = :ingredients, steps = :steps, image_path = :image_path, status = :status WHERE id = :id");
    $stmt->bindParam(':title', $title, PDO::PARAM_STR);
    $stmt->bindParam(':cook_time', $cook_time, PDO::PARAM_INT);
    $stmt->bindParam(':category', $category, PDO::PARAM_STR);
    $stmt->bindParam(':ingredients', $ingredients, PDO::PARAM_STR);
    $stmt->bindParam(':steps', $steps, PDO::PARAM_STR);
    $stmt->bindParam(':image_path', $imagePath, PDO::PARAM_STR);
    $stmt->bindParam(':status', $status, PDO::PARAM_STR);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Рецепт обновлён']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка обновления']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка БД: ' . $e->getMessage()]);
}
exit;
?>
