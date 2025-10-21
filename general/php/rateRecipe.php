<?php
session_start();
header('Content-Type: application/json');

// Проверяем авторизацию пользователя
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Неавторизован
    echo json_encode(['success' => false, 'error' => 'Пользователь не авторизован']);
    exit;
}

require 'config.php'; // Подключение к БД (предполагаю, что config.php содержит $pdo = new PDO(...))

// Получаем данные из POST-запроса
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['recipe_id']) || !isset($input['rating'])) {
    http_response_code(400); // Неверный запрос
    echo json_encode(['success' => false, 'error' => 'Отсутствуют recipe_id или rating']);
    exit;
}

$recipe_id = (int)$input['recipe_id'];
$rating = (int)$input['rating'];
$user_id = $_SESSION['user_id'];

// Проверяем диапазон рейтинга (предположим от 1 до 5)
if ($rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'error' => 'Рейтинг должен быть от 1 до 5']);
    exit;
}

try {
    // Проверяем, есть ли уже рейтинг от этого пользователя для данного рецепта
    $stmt = $pdo->prepare('SELECT id FROM ratings WHERE user_id = :user_id AND recipe_id = :recipe_id');
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':recipe_id', $recipe_id, PDO::PARAM_INT);
    $stmt->execute();
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // Обновляем существующий рейтинг
        $stmt = $pdo->prepare('UPDATE ratings SET rating = :rating WHERE id = :id');
        $stmt->bindParam(':rating', $rating, PDO::PARAM_INT);
        $stmt->bindParam(':id', $existing['id'], PDO::PARAM_INT);
        $stmt->execute();
    } else {
        // Вставляем новый рейтинг
        $stmt = $pdo->prepare('INSERT INTO ratings (user_id, recipe_id, rating) VALUES (:user_id, :recipe_id, :rating)');
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':recipe_id', $recipe_id, PDO::PARAM_INT);
        $stmt->bindParam(':rating', $rating, PDO::PARAM_INT);
        $stmt->execute();
    }

    echo json_encode(['success' => true, 'message' => 'Рейтинг сохранён']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Ошибка сохранения рейтинга: ' . $e->getMessage()]);
}
?>
