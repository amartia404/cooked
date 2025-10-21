<?php
header('Content-Type: application/json');
require 'config.php';  // Подключение к БД

try {
    // Получаем user_id из сессии (если пользователь авторизован)
    $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

    $stmt = $pdo->prepare('
        SELECT r.id, r.title, r.cook_time AS cookTime, r.category, r.ingredients, r.steps, r.image_path AS imageUrl, 
               u.username AS author, u.id AS author_id, r.created_at, r.status,
               GROUP_CONCAT(rt.rating SEPARATOR \',\') AS ratings,  -- Агрегация как строка (если пусто, NULL)
               rt_user.rating AS userRating
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN ratings rt ON rt.recipe_id = r.id
        LEFT JOIN ratings rt_user ON rt_user.recipe_id = r.id AND rt_user.user_id = ?
        WHERE r.status = "approved"
        GROUP BY r.id
        ORDER BY r.created_at DESC
    ');
    $stmt->bindParam(1, $userId, PDO::PARAM_INT);
    $stmt->execute();
    $recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Преобразование строк/массивов (как в оригинале) плюс рейтинги
    foreach ($recipes as &$recipe) {
        $recipe['ingredients'] = json_decode($recipe['ingredients'], true) ?? explode(',', $recipe['ingredients']);
        $recipe['steps'] = json_decode($recipe['steps'], true) ?? explode(',', $recipe['steps']);
        $recipe['ratings'] = $recipe['ratings'] ? array_map('intval', explode(',', $recipe['ratings'])) : [];  // Преобразуем строку в массив int, или пустой
        $recipe['userRating'] = $recipe['userRating'] ? (int)$recipe['userRating'] : null;  // Личный рейтинг (null, если нет)
    }

    echo json_encode(['success' => true, 'recipes' => $recipes]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка загрузки одобренных рецептов: ' . $e->getMessage()]);
}
?>
