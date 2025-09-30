<?php
header('Content-Type: application/json');
require 'config.php';  // Подключение к БД

try {
    $stmt = $pdo->prepare('SELECT r.id, r.title, r.cook_time AS cookTime, r.category, r.ingredients, r.steps, r.image_path AS imageUrl, u.username AS author, r.created_at FROM recipes r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC');
    $stmt->execute();
    $recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Преобразуем строки в массивы (предполагая, что ingredients и steps — JSON или разделённые строки)
    foreach ($recipes as &$recipe) {
        $recipe['ingredients'] = json_decode($recipe['ingredients'], true) ?? explode(',', $recipe['ingredients']);
        $recipe['steps'] = json_decode($recipe['steps'], true) ?? explode(',', $recipe['steps']);
        $recipe['ratings'] = [];  // Если рейтинги хранятся отдельно, добавьте запрос
        $recipe['userRatings'] = [];  // Аналогично
    }

    echo json_encode(['success' => true, 'recipes' => $recipes]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка загрузки рецептов: ' . $e->getMessage()]);
}
?>
