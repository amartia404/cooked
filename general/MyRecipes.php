<?php
$host = 'localhost';
$dbname = 'cookbook';
$dbUsername = 'root';
$dbPassword = '';

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
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
      $username = $user['username'];
      $isAdmin = (bool) $user['is_admin'];
      $avatar = $user['avatar'] ?? "";
      $_SESSION['avatar'] = $avatar;
      $_SESSION['username'] = $username;
      $_SESSION['is_admin'] = $isAdmin;
    }
  } catch (PDOException $e) {
    error_log("Error loading user data: " . $e->getMessage());
  }
}
?>
<script>
	window._CURRENT_USER = <?= json_encode($isLoggedIn ? [
		'username' => $username,
		'isAdmin' => (bool) $isAdmin,
		'avatar' => $avatar,
	] : null) ?>;
</script>

<!DOCTYPE html>
<html lang="ru">

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Кулинарная книга</title>
	<link rel="icon" type="image/png" href="img/logo.png">
	<link rel="stylesheet" href="styles.css" />
	<link rel="stylesheet" href="css/styles.css" />
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
	<section id="myRecipesSection">
		<div class="container" style="display: block;">
			<h2>Мои рецепты</h2>
			<div id="myRecipesList"></div>
		</div>
	</section>
</div>

<footer>
	<div class="container">
		<p>© 2025 Кулинарная книга. Все права защищены.</p>
	</div>
</footer>

<!-- <script src="js/script.js"></script> -->
<script src="js/profile.js"></script>

<script>
	async function loadMyRecipes() {
    try {
        const response = await fetch('php/getMyRecipes.php'); // Предполагаю путь относительно index.php
        const data = await response.json();
        if (data.success) {
            const myRecipesList = document.getElementById('myRecipesList');
            myRecipesList.innerHTML = ''; // Очищаем список
            if (data.recipes.length === 0) {
                myRecipesList.innerHTML = '<p>У вас пока нет рецептов.</p>';
            } else {
                data.recipes.forEach(recipe => {
                    const recipeEl = document.createElement('div');
                    recipeEl.className = 'recipe-item';
                    recipeEl.innerHTML = `
                        <h3>${recipe.title}</h3>
                        <p><strong>Статус:</strong> ${recipe.status}</p> <!-- Показ статус для "моих", если нужно -->
                        <p><strong>Автор:</strong> ${recipe.author}</p>
                        <img src="${recipe.imageUrl || 'img/default-recipe.png'}" alt="${recipe.title}" />
                        <button type="button" onclick="openRecipeViewModal(${recipe.id})">Просмотреть</button>
                        <!-- Добавьте кнопки редактирования при необходимости -->
                    `;
                    myRecipesList.appendChild(recipeEl);
                });
            }
        } else {
            console.error('Ошибка загрузки рецептов:', data.error);
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
    }
}

loadMyRecipes()

</script>

</body>
</html>