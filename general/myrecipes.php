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

<div id="recipeViewModal" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="recipeViewTitle">
	<div class="modal-content" role="document">
		<button id="btnCloseRecipeView" class="btn-close-modal" aria-label="Закрыть рецепт">×</button>
		<h2 id="recipeViewTitle"></h2>
		<img id="recipeViewImage"/>
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

<footer>
	<div class="container">
		<p>© 2025 Кулинарная книга. Все права защищены.</p>
	</div>
</footer>

<script src="js/myrecipes.js"></script>

</body>
</html>
