<?php
$host = 'localhost';
$dbname = 'cookbook';
$username_db = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username_db, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Ошибка подключения: " . $e->getMessage());
}

// Получение ID пользователя из URL (через .htaccess или $_GET['id'])
$user_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($user_id <= 0) {
    die("Неверный ID пользователя.");
}

// Получение данных пользователя
$stmt = $pdo->prepare("SELECT username, avatar FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    die("Пользователь не найден.");
}

// Получение рецептов пользователя (предполагаем таблицу recipes с полями id, title, user_id)
$stmt_recipes = $pdo->prepare("SELECT id, title FROM recipes WHERE user_id = ? LIMIT 10"); // Ограничьте для производительности
$stmt_recipes->execute([$user_id]);
$recipes = $stmt_recipes->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Профиль пользователя: <?php echo htmlspecialchars($user['username']); ?></title>
	<link rel="icon" type="image/png" href="img/logo.png">
	<link rel="stylesheet" href="styles.css" />
	<link rel="stylesheet" href="css/styles.css" />
</head>
<body>
    <header>
        <div class="container">
            <img src="img/logo.png" class="logo">
            <h1 class="site-title"><a href="../index.php">Кулинарная книга</a></h1>
        </div>
    </header>

    <div class="container">
        <h2>Профиль пользователя</h2>
        <div class="profile-info">
            <?php if ($user['avatar']): ?>
                <img src="<?php echo htmlspecialchars($user['avatar']); ?>" alt="Аватар" style="max-width: 150px; border-radius: 50%;">
            <?php endif; ?>
            <h3><?php echo htmlspecialchars($user['username']); ?></h3>
        </div>
        <h4>Рецепты пользователя:</h4>
        <ul>
            <?php if ($recipes): ?>
                <?php foreach ($recipes as $recipe): ?>
                    <li><a href="view_recipe.php?id=<?php echo $recipe['id']; ?>"><?php echo htmlspecialchars($recipe['title']); ?></a></li>
                <?php endforeach; ?>
            <?php else: ?>
                <li>Рецепты не найдены.</li>
            <?php endif; ?>
        </ul>
    </div>

    <footer>
        <div class="container">
            <p>© 2025 Кулинарная книга. Все права защищены.</p>
        </div>
    </footer>
</body>
</html>