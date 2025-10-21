<?php
session_start(); // Восстанавливаем сессию для проверки авторизации

// Проверяем, является ли пользователь авторизованным
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Неавторизован
    echo json_encode(['success' => false, 'error' => 'Пользователь не авторизован']);
    exit;
}

header('Content-Type: application/json');
require 'config.php'; // Подключение к БД

$user_id = $_SESSION['user_id']; // ID текущего пользователя из сессии

try {
    $stmt = $pdo->prepare('
        SELECT r.id, r.title, r.cook_time AS cookTime, r.category, r.ingredients, r.steps, r.image_path AS imageUrl, u.username AS author, u.id AS author_id, r.created_at, r.status
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        WHERE r.user_id = :user_id
        ORDER BY r.created_at DESC
    ');
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Преобразование строк/массивов (как в оригинале)
    foreach ($recipes as &$recipe) {
        $recipe['ingredients'] = json_decode($recipe['ingredients'], true) ?? explode(',', $recipe['ingredients']);
        $recipe['steps'] = json_decode($recipe['steps'], true) ?? explode(',', $recipe['steps']);
        $recipe['ratings'] = []; // Добавьте JOIN к таблице рейтингов, если есть (например, средний рейтинг)
        $recipe['userRatings'] = []; // Добавьте JOIN для пользовательских рейтингов, если есть
    }

    echo json_encode(['success' => true, 'recipes' => $recipes]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка загрузки рецептов пользователя: ' . $e->getMessage()]);
}
?>
