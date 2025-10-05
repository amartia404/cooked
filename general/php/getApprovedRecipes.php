<?php
header('Content-Type: application/json');
require 'config.php';  // Подключение к БД

try {
    $stmt = $pdo->prepare('
        SELECT r.id, r.title, r.cook_time AS cookTime, r.category, r.ingredients, r.steps, r.image_path AS imageUrl, u.username AS author, r.created_at, r.status
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        WHERE r.status = "approved"
        ORDER BY r.created_at DESC
    ');
    $stmt->execute();
    $recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Преобразование строк/массивов (как в оригинале)
    foreach ($recipes as &$recipe) {
        $recipe['ingredients'] = json_decode($recipe['ingredients'], true) ?? explode(',', $recipe['ingredients']);
        $recipe['steps'] = json_decode($recipe['steps'], true) ?? explode(',', $recipe['steps']);
        $recipe['ratings'] = [];  // Добавьте JOIN к таблице рейтингов, если есть
        $recipe['userRatings'] = [];
    }

    echo json_encode(['success' => true, 'recipes' => $recipes]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка загрузки одобренных рецептов: ' . $e->getMessage()]);
}
?>
