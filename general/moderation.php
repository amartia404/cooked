<?php
$host = 'localhost';
$dbname = 'cookbook';
$username_db = 'root'; // Чтобы не конфликтовать с переменной $username
$password = '';

session_start(); // Восстанавливаем сессию

$isLoggedIn = isset($_SESSION['user_id']);
$userUsername = $_SESSION['username'] ?? null;
$isAdmin = $_SESSION['is_admin'] ?? false;
$avatar = $_SESSION['avatarDataUrl'] ?? "";

// Если не залогинен или не админ, перенаправляем
if (!$isLoggedIn || !$isAdmin) {
    header('Location: index.php');
    exit();
}
?>

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
		<nav id="categoryNav" class="category-nav" aria-label="Категории рецептов">
			<button type="button" class="category-btn">Все</button>
			<button type="button" class="category-btn">Мясо</button>
			<button type="button" class="category-btn">Рыба</button>
			<button type="button" class="category-btn">Веганское</button>
			<button type="button" class="category-btn">Десерты</button>
		</nav>
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
  <section id="moderationSection">
    <div class="container" style="display: block;">
      <h2>Модерация новых рецептов</h2>
      <div id="moderationList"></div>
    </div>
  </section>  
</div>

<div id="recipeViewModal" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="recipeViewTitle">
  <div class="modal-content" role="document">
    <button type="button" class="btn-close-modal" id="btnCloseRecipeView" aria-label="Закрыть рецепт">×</button>
    <h2 id="recipeViewTitle"></h2>
    <img id="recipeViewImage" alt="" style="max-width: 100%; border-radius: 8px; margin-bottom: 15px; display: none;" />
    <p><b>Время приготовления:</b> <span id="recipeViewCookTime"></span> мин</p>
    <p><b>Категория:</b> <span id="recipeViewCategory"></span></p>
    <h3>Ингредиенты</h3>
    <ul id="recipeViewIngredients"></ul>
    <h3>Шаги приготовления</h3>
    <ol id="recipeViewSteps"></ol>
    <p id="recipeViewRating"></p>
  </div>
</div>

<footer>
  <div class="container">
    <p>© 2024 Кулинарная книга. Все права защищены.</p>
  </div>
</footer>

<script>
  window._CURRENT_USER = <?php echo json_encode(['username' => $userUsername, 'isAdmin' => $isAdmin]); ?>;
</script>

<script src="js/moderation.js"></script>

</body>
</html>