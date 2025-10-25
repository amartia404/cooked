<?php
// Настройки БД (лучше вынести в отдельный конфиг-файл для безопасности)
$host = 'localhost';
$dbname = 'cookbook';
$dbUsername = 'root';
$dbPassword = '';

// Инициализация сессии и получение данных текущего пользователя
session_start();
$isLoggedIn = isset($_SESSION['user_id']);
$username = $_SESSION['username'] ?? null;
$isAdmin = $_SESSION['is_admin'] ?? false;
$avatar = $_SESSION['avatar'] ?? "";

if ($isLoggedIn) {
  try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $dbUsername, $dbPassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->prepare("SELECT username, avatar, is_admin FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($userData) {
      $username = $userData['username'];
      $isAdmin = (bool) $userData['is_admin'];
      $avatar = $userData['avatar'] ?? "";
      $_SESSION['avatar'] = $avatar;
      $_SESSION['username'] = $username;
      $_SESSION['is_admin'] = $isAdmin;
    }
  } catch (PDOException $e) {
    error_log("Error loading current user data: " . $e->getMessage());
  }
}

// Передача данных текущего пользователя в JS
echo '<script>';
echo 'window._CURRENT_USER = ' . json_encode($isLoggedIn ? [
  'username' => $username,
  'isAdmin' => $isAdmin,
  'avatar' => $avatar,
] : null) . ';';
echo '</script>';

// Получение ID профиля из URL (пусть это user.php?id=123)
$userProfileId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($userProfileId <= 0) {
  die("Неверный ID пользователя.");
}

// Подключение к БД (если не подключено выше)
if (!isset($pdo)) {
  try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $dbUsername, $dbPassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  } catch (PDOException $e) {
    die("Ошибка подключения: " . $e->getMessage());
  }
}

// Получение данных профиля
$stmt = $pdo->prepare("SELECT username, avatar FROM users WHERE id = ?"); // Добавил is_active для безопасности (если есть поле)
$stmt->execute([$userProfileId]);
$profileUser = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profileUser) {
  die("Пользователь не найден.");
}

// Получение рецептов профиля (предполагаю таблицу recipes с user_id)
$stmtRecipes = $pdo->prepare("SELECT id, title FROM recipes WHERE user_id = ? ORDER BY id DESC LIMIT 10");
$stmtRecipes->execute([$userProfileId]);
$recipes = $stmtRecipes->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Профиль пользователя: <?php echo htmlspecialchars($profileUser['username']); ?></title>
    <base href="/general/">
    <link rel="icon" type="image/png" href="img/logo.png">
    <link rel="stylesheet" href="styles.css" />
    <link rel="stylesheet" href="css/styles.css" />
    <link rel="stylesheet" href="css/user.css" />
</head>
<body>
    <header>
        <div class="container">
            <img src="img/logo.png" class="logo">
            <h1 class="site-title"><a href="index.php" id="homeLink">Кулинарная книга</a></h1>
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
            <?php if ($profileUser['avatar']): ?>
                <img src="<?php echo htmlspecialchars($profileUser['avatar']); ?>" alt="Аватар" style="max-width: 150px; border-radius: 50%;">
            <?php endif; ?>
            <h3><?php echo htmlspecialchars($profileUser['username']); ?></h3>
        </div>
        <h4>Рецепты пользователя:</h4>
        <ul>
            <?php if ($recipes): ?>
                <?php foreach ($recipes as $recipe): ?>
                    <li><button onclick="openRecipeModal(<?php echo $recipe['id']; ?>)" style="background: none; border: none; color: #007bff; cursor: pointer; text-decoration: underline;"><?php echo htmlspecialchars($recipe['title']); ?></button></li>
                <?php endforeach; ?>
            <?php else: ?>
                <li>Рецепты не найдены.</li>
            <?php endif; ?>
        </ul>
    </div>

    <!-- Модальное окно для просмотра рецепта (скопировано из index.php, проверено на наличие) -->
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

    <!-- <script src="../js/script.js"></script> -->
    <script src="js/profile.js"></script>
</body>
</html>