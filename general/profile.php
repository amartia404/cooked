<?php
$host = 'localhost';
$dbname = 'cookbook';
$username_db = 'root';
$password = '';

session_start();

header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
header("Pragma: no-cache"); // HTTP 1.0.
header("Expires: 0"); // Прокси-серверы.

// Проверка авторизации
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php'); // Перенаправление на главную, если не авторизован
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username_db, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Ошибка подключения: " . $e->getMessage());
}

// Получение данных пользователя (теперь avatar - путь к файлу)
$user_id = $_SESSION['user_id'];
$stmt = $pdo->prepare("SELECT username, avatar FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    die("Пользователь не найден.");
}

// Обработка формы обновления
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $new_username = trim($_POST['username']);
    $new_avatar_path = $user['avatar']; // Старый путь по умолчанию

    // Проверка и обработка аватара (если загружен файл) - сохраняем как файл, а не base64
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $file_type = $_FILES['avatar']['type'];
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        if (in_array($file_type, $allowed_types)) {
            $upload_dir = 'img/avatars/'; // Папка для аватаров
            if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

            $file_ext = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
            $file_name = $user['username'] . '_' . $user_id . '.' . $file_ext; // Уникальное имя
            $file_path = $upload_dir . $file_name;

            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $file_path)) {
                // Если старый аватар существует, удаляем (опционально, но рекомендуется)
                if ($user['avatar'] && file_exists($user['avatar'])) {
                    unlink($user['avatar']);
                }
                $new_avatar_path = $file_path;
            } else {
                $error = "Ошибка загрузки файла.";
            }
        } else {
            $error = "Неверный формат файла. Разрешены JPG, PNG, GIF.";
        }
    }

    // Обновление логина (если изменился)
    if ($new_username !== $user['username']) {
        // Проверка уникальности логина
        $stmt_check = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt_check->execute([$new_username, $user_id]);
        if ($stmt_check->fetch()) {
            $error = "Логин уже занят.";
        } else {
            $stmt_update = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
            $stmt_update->execute([$new_username, $user_id]);
            $_SESSION['username'] = $new_username; // Обновление сессии
            $user['username'] = $new_username; // Обновление локального $user
        }
    }

    // Обновление аватара в БД
    if ($new_avatar_path !== $user['avatar']) {
        $stmt_update = $pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
        $stmt_update->execute([$new_avatar_path, $user_id]);
        $_SESSION['avatar'] = $new_avatar_path; // Обновление сессии (теперь путь, не base64)
        $user['avatar'] = $new_avatar_path; // Обновление локального $user
    }

    if (!isset($error)) {
        $success = "Профиль обновлен!";
    }
}

$isLoggedIn = true;
$username = $user['username'];
$isAdmin = $_SESSION['is_admin'] ?? false;
$avatar = $user['avatar'] ?? '';
?>
<script>
window._CURRENT_USER = {
    'username': '<?= htmlspecialchars($username) ?>',
    'isAdmin': <?= json_encode($isAdmin) ?>,
    'avatar': '<?= htmlspecialchars($avatar) ?>'
};
</script>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Кулинарная книга</title>
    <link rel="icon" type="image/png" href="img/logo.png">
    <link rel="stylesheet" href="styles.css" />
    <link rel="stylesheet" href="css/profile.css" />
</head>
<body>
    <header>
        <div class="container">
            <img src="img/logo.png" class="logo">
            <h1 class="site-title"><a href="index.php">Кулинарная книга</a></h1>
            <nav aria-label="Пользовательское меню" id="userNav" class="userNav">
                <button class="user-avatar-btn" aria-haspopup="true" aria-expanded="false" aria-label="Меню пользователя"></button>
                <div class="user-menu" role="menu">
				<button type="button" id="userMenu_profile" role="menuitem">Личный кабинет</button>
				<button type="button" id="userMenu_myRecipes" role="menuitem">Мои рецепты</button>
				<button type="button" id="userMenu_addRecipe" role="menuitem">Добавить рецепт/Модерация</button>
				<button type="button" id="userMenu_logout" role="menuitem">Выйти</button>
                </div>
            </nav>
        </div>
    </header>

    <div class="container" style="display: grid">
        <h2 style=" justify-self: center">Личный кабинет</h2>
        <?php if (isset($error)): ?>
            <p style="color: red;"><?php echo htmlspecialchars($error); ?></p>
        <?php endif; ?>
        <?php if (isset($success)): ?>
            <p style="color: green;"><?php echo htmlspecialchars($success); ?></p>
        <?php endif; ?>
        <form method="POST" enctype="multipart/form-data" style="display: grid;">
            <label>Логин: <input type="text" name="username" value="<?php echo htmlspecialchars($user['username']); ?>" required></label>
            <label>Аватар: <input type="file" name="avatar" accept="image/*">
                <?php if ($user['avatar']): ?>
                    <img src="<?php echo htmlspecialchars($user['avatar']); ?>" alt="Текущий аватар" style="max-width: 100px; max-height: 100px;">
                <?php endif; ?>
            </label>
            <button type="submit">Сохранить изменения</button>
        </form>
    </div>

    <footer>
        <div class="container">
            <p>© 2025 Кулинарная книга. Все права защищены.</p>
        </div>
    </footer>

    <script src="js/profile.js"></script>
</body>
</html>
