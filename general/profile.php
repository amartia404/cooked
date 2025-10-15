<?php
session_start();

header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
header("Pragma: no-cache"); // HTTP 1.0.
header("Expires: 0"); // Прокси-серверы.

// Проверка авторизации
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php'); // Перенаправление на главную, если не авторизован
    exit;
}

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

// Получение данных пользователя
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
    $new_avatar_data = null;

    // Проверка и обработка аватара (если загружен файл)
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $file_type = $_FILES['avatar']['type'];
        if (in_array($file_type, ['image/jpeg', 'image/png', 'image/gif'])) {
            $file_data = file_get_contents($_FILES['avatar']['tmp_name']);
            $new_avatar_data = 'data:' . $file_type . ';base64,' . base64_encode($file_data);
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
        }
    }

    // Обновление аватара
    if ($new_avatar_data) {
        $stmt_update = $pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
        $stmt_update->execute([$new_avatar_data, $user_id]);
        $_SESSION['avatarDataUrl'] = $new_avatar_data; // Обновление сессии
    }

    if (!isset($error)) {
        $success = "Профиль обновлен!";
        // Перезагрузка данных
        $stmt = $pdo->prepare("SELECT username, avatar FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Кулинарная книга</title>
	<link rel="icon" type="image/png" href="img/logo.png">
	<!-- <link rel="stylesheet" href="styles.css" /> -->
	<link rel="stylesheet" href="css/profile.css" />
</head>
<body>
    <header>
        <div class="container">
            <img src="img/logo.png" class="logo">
            <h1 class="site-title"><a href="index.php">Кулинарная книга</a></h1>
            <nav aria-label="Пользовательское меню" class="userNav">
                <button class="user-avatar-btn" aria-haspopup="true" aria-expanded="false" aria-label="Меню пользователя"></button>
                <div class="user-menu" role="menu">
                    <button onclick="location.href='profile.php'">Личный кабинет</button>
                    <button onclick="location.href='index.php'">Мои рецепты</button>
                    <button onclick="location.href='index.php'">Добавить рецепт</button>
                    <button onclick="location.href='logout.php'">Выйти</button>
                </div>
            </nav>
        </div>
    </header>

    <div class="container">
        <h2>Личный кабинет</h2>
        <?php if (isset($error)): ?>
            <p style="color: red;"><?php echo $error; ?></p>
        <?php endif; ?>
        <?php if (isset($success)): ?>
            <p style="color: green;"><?php echo $success; ?></p>
        <?php endif; ?>
        <form method="POST" enctype="multipart/form-data">
            <label>Логин: <input type="text" name="username" value="<?php echo htmlspecialchars($user['username']); ?>" required></label>
            <label>Аватар: <input type="file" name="avatar" accept="image/*">
                <?php if ($user['avatar']): ?>
                    <img src="<?php echo htmlspecialchars($user['avatar']); ?>" alt="Текущий аватар" style="max-width: 100px; margin-top: 10px;">
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

    <script src="js/script.js"></script>
</body>
</html>
