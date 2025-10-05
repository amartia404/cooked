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
		<!-- <nav id="categoryNav" class="category-nav" aria-label="Категории рецептов">
			<button type="button" class="category-btn">Все</button>
			<button type="button" class="category-btn">Мясо</button>
			<button type="button" class="category-btn">Рыба</button>
			<button type="button" class="category-btn">Веганское</button>
			<button type="button" class="category-btn">Десерты</button>
		</nav> -->
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

<!-- <section id="main" class="main">
	<div class="container">
		<div id="recipesSection" class="recipes-section">
			<div class="recipes-header">
				<h2>Рецепты</h2>
				<nav class="sortNav" aria-label="Сортировка рецептов">
					<button type="button" data-sort-key="relevance" class="">По релевантности</button>
					<button type="button" data-sort-key="popularity" class="">По популярности</button>
					<button type="button" data-sort-key="rating" class="">По рейтингу</button>
					<button type="button" data-sort-key="cookTime" class="">По времени</button>
					<button type="button" data-sort-key="title" class="">По названию</button>
				</nav>
			</div>
			<section id="recipeListSection" class="recipe-list-section" aria-live="polite" aria-atomic="true" tabindex="0"></section>
		</div>

		<div id="ingredientsColumn" class="ingredients-column">
			<h2 class="Ingredients">Ингредиенты</h2>
			<aside id="ingredientsFilter" aria-label="Фильтр ингредиентов"></aside>
		</div>
	</div>
</section> -->

<!------------------------------------------------------------------------------------------------------->
<div class="container">
	<section id="profileSection">
		<div class="container" style="display: block;">
			<h2>Личный кабинет</h2>
			<form id="profileFormSection">
				<label>Имя пользователя<input type="text" id="profileUsernameSection" readonly /></label>
				<label>Аватар<input type="file" id="profileAvatarInputSection" accept="image/*" /><img id="profileAvatarPreviewSection" class="profileAvatarPreviewSection" alt="Аватар пользователя"/></label>
				<button type="submit">Сохранить</button>
			</form>
		</div>
	</section>

	<!-- <section id="myRecipesSection" hidden>
		<div class="container" style="display: block;">
			<h2>Мои рецепты</h2>
			<div id="myRecipesList"></div>
		</div>
	</section> -->
</div>

<!-- <div id="modalOverlay" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="modalTitle">
	<div class="modal-content" role="document">
		<button id="btnCloseModal" class="btn-close-modal" aria-label="Закрыть форму">×</button>
		<form id="recipeForm" aria-label="Форма добавления/редактирования рецепта" enctype="multipart/form-data">
			<h2 id="modalTitle">Добавить новый рецепт</h2>
			<label>Название рецепта<input type="text" id="inputTitle" placeholder="Например, Борщ" required /></label>
			<label>Время приготовления (минуты)<input type="number" id="inputCookTime" min="1" placeholder="Например, 45" required /></label>
			<label>Категория
				<select id="inputCategory" required>
					<option value="">Выберите категорию</option>
					<option value="мясо">Мясо</option>
					<option value="рыба">Рыба</option>
					<option value="веганское">Веганское</option>
					<option value="десерты">Десерты</option>
				</select>
			</label>
			<label>Ингредиенты<div id="ingredientsContainer"></div><button type="button" id="btnAddIngredient">Добавить ингредиент</button></label>
			<label>Шаги приготовления<div id="stepsContainer"></div><button type="button" id="btnAddStep">Добавить шаг</button></label>
			<label>Фото рецепта<input type="file" id="inputImageFile" accept="image/*" /><img id="imagePreview" alt="Превью фото рецепта"/></label>
			<button type="submit" id="btnSubmitRecipe">Добавить рецепт</button>
		</form>
	</div>
</div> -->

<!-- <div id="authModal" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
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
</div> -->

<!-- <div id="recipeViewModal" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="recipeViewTitle">
	<div class="modal-content" role="document">
		<button id="btnCloseRecipeView" class="btn-close-modal" aria-label="Закрыть рецепт">×</button>
		<h2 id="recipeViewTitle"></h2>
		<img id="recipeViewImage"/>
		<p><b>Время приготовления:</b> <span id="recipeViewCookTime"></span> мин</p>
		<p><b>Категория:</b> <span id="recipeViewCategory"></span></p>
		<h3>Ингредиенты</h3>
		<ul id="recipeViewIngredients"></ul>
		<h3>Шаги приготовления</h3>
		<ol id="recipeViewSteps"></ol>
		<p id="recipeViewRating"></p>
	</div>
</div> -->
<!------------------------------------------------------------------------------------------------------->

<footer>
	<div class="container">
		<p>© 2025 Кулинарная книга. Все права защищены.</p>
	</div>
</footer>

<script src="js/script.js"></script>

</body>
</html>