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
    <link rel="icon" type="image/png" href="../img/logo.png">
    <link rel="stylesheet" href="../styles.css" />
	<link rel="stylesheet" href="../css/styles.css" />
    <link rel="stylesheet" href="../css/user.css" />
</head>
<body>
		<header>
			<div class="container">
				<img src="../img/logo.png" class="logo">
				<h1 class="site-title"><a href="../index.php" id="homeLink">Кулинарная книга</a></h1>
				<nav aria-label="Пользовательское меню" id="userNav" class="userNav">
					<button class="user-avatar-btn" aria-haspopup="true" aria-expanded="false" aria-label="Меню пользователя" type="button"></button>
					<div class="user-menu" role="menu">
						<button type="button" id="userMenu_profile" role="menuitem">Личный кабинет</button>
						<button type="button" id="userMenu_myRecipes" role="menuitem">Мои рецепты</button>
						<button type="button" id="userMenu_addRecipe" role="menuitem">Добавить рецепт/Модерация</button>
						<button type="button" id="userMenu_logout" role="menuitem">Выйти</button>
					</div>
				</nav>
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
                    <!-- Замена ссылки на кнопку с onclick -->
                    <li><button onclick="openRecipeModal(<?php echo $recipe['id']; ?>)" style="background: none; border: none; color: #007bff; cursor: pointer; text-decoration: underline;"><?php echo htmlspecialchars($recipe['title']); ?></button></li>
                <?php endforeach; ?>
            <?php else: ?>
                <li>Рецепты не найдены.</li>
            <?php endif; ?>
        </ul>
    </div>

    <!-- Модальное окно для просмотра рецепта (скопировано из index.php) -->
    <div id="recipeViewModal" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="recipeViewTitle">
        <div class="modal-content" role="document">
            <button id="btnCloseRecipeView" class="btn-close-modal" aria-label="Закрыть рецепт">×</button>
            <h2 id="recipeViewTitle"></h2>
            <img id="recipeViewImage" alt="Фото рецепта" />
            <p><b>Время приготовления:</b> <span id="recipeViewCookTime"></span> мин</p>
            <p><b>Категория:</b> <span id="recipeViewCategory"></span></p>
            <p><b>Автор:</b> <a id="recipeViewAuthor" href="#"></a></p>
            <h3>Ингредиенты</h3>
            <ul id="recipeViewIngredients"></ul>
            <h3>Шаги приготовления</h3>
            <ol id="recipeViewSteps"></ol>
            <p id="recipeViewRating"></p>
        </div>
    </div>

	<div id="authModal" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
		<div class="modal-content" role="document">
			<button id="btnCloseAuthModal" class="btn-close-modal" aria-label="Закрыть форму">×</button>
			<div id="authTabs">
				<button id="tabLogin" class="auth-tab active" type="button" aria-selected="true" aria-controls="loginForm">Вход</button>
				<button id="tabRegister" class="auth-tab" type="button" aria-selected="false" aria-controls="registerForm">Регистрация</button>
			</div>

			<form id="loginForm" class="auth-form" aria-label="Форма входа">
				<label>Email<input type="email" name="email" required autocomplete="email" /></label>
				<label>Пароль<input type="password" name="password" required autocomplete="current-password" /></label>
				<button type="submit">Войти</button>
			</form>

			<form id="registerForm" class="auth-form" action="php/register.php" method="post" aria-label="Форма регистрации">
				<label>Логин<input type="text" name="username" required autocomplete="username" /></label>
				<label>Email<input type="email" name="email" required autocomplete="email" /></label>
				<label>Пароль<input type="password" name="password" required autocomplete="new-password" /></label>
				<label>Подтвердите пароль<input type="password" name="password_confirm" required autocomplete="new-password" /></label>
				<button type="submit">Зарегистрироваться</button>
			</form>
		</div>
	</div>

    <footer>
        <div class="container">
            <p>© 2025 Кулинарная книга. Все права защищены.</p>
        </div>
    </footer>

<script src="../js/script.js"></script>

</body>
</html>
