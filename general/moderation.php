<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Модерация рецептов</title>
  <link rel="icon" type="image/png" href="img/1582346 (1).png">
  <link rel="stylesheet" href="styles.css" />
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>

<header>
  <div class="container">
    <img src="img/1582346 (1).png" style="height: 40px;">
    <h1 class="site-title"><a href="index.php" id="homeLink">Кулинарная книга</a></h1>





<!------------------------------------------------------------------------------------------------------->
    <nav class="category-nav" aria-label="Категории рецептов" id="categoryNav">
      <button type="button" class="category-btn">Все</button>
      <button type="button" class="category-btn">Мясо</button>
      <button type="button" class="category-btn">Рыба</button>
      <button type="button" class="category-btn">Веганское</button>
      <button type="button" class="category-btn">Десерты</button>
    </nav>
<!------------------------------------------------------------------------------------------------------->







    <nav aria-label="Пользовательское меню" id="userNav" style="margin-left: 30px; position: relative; display: flex;">
      <button class="user-avatar-btn" aria-haspopup="true" aria-expanded="false" aria-label="Меню пользователя" type="button"></button>







<!------------------------------------------------------------------------------------------------------->
      <div class="user-menu" role="menu">
        <button type="button" id="userMenu_profile" role="menuitem">Личный кабинет</button>
        <button type="button" id="userMenu_myRecipes" role="menuitem">Мои рецепты</button>
        <button type="button" id="userMenu_addRecipe" role="menuitem">Добавить рецепт/Модерация</button>
        <button type="button" id="userMenu_logout" role="menuitem">Выйти</button>
      </div>
<!------------------------------------------------------------------------------------------------------->





    </nav>
<!------------------------------------------------------------------------------------------------------->
    <div id="authModal" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
      <div class="modal-content" role="document">
        <button class="btn-close-modal" id="btnCloseAuthModal" aria-label="Закрыть форму">×</button>
        <div id="authTabs">
          <button id="tabLogin" class="auth-tab active" type="button" aria-selected="true" aria-controls="loginForm">Вход</button>
          <button id="tabRegister" class="auth-tab" type="button" aria-selected="false" aria-controls="registerForm">Регистрация</button>
        </div>

        <!-- <form id="loginForm" class="auth-form" aria-label="Форма входа">
          <label>Логин<input type="text" id="loginUsername" required autocomplete="username" /></label>
          <label>Пароль<input type="password" id="loginPassword" required autocomplete="current-password" /></label>
          <button type="submit">Войти</button>      
        </form> -->

        <!-- <form id="registerForm" class="auth-form" hidden aria-label="Форма регистрации">
          <label>Логин<input type="text" id="registerUsername" required autocomplete="username" /></label>
          <label>Пароль<input type="password" id="registerPassword" required autocomplete="new-password" /></label>
          <label>Подтвердите пароль<input type="password" id="registerPasswordConfirm" required autocomplete="new-password" /></label>
          <button type="submit">Зарегистрироваться</button>
        </form> -->
      </div>
    </div>
<!------------------------------------------------------------------------------------------------------->
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

<section id="profileSection" hidden>
  <div class="container" style="display: block;">
    <h2>Личный кабинет</h2>
    <form id="profileFormSection">
      <label>Имя пользователя<input type="text" id="profileUsernameSection" readonly /></label>
      <label>Аватар<input type="file" id="profileAvatarInputSection" accept="image/*" /><img id="profileAvatarPreviewSection" alt="Аватар пользователя" style="max-width: 150px; border-radius: 50%; margin-top: 10px; display:none;" /></label>
      <button type="submit">Сохранить</button>
    </form>
  </div>
</section>

<footer>
  <div class="container">
    <p>© 2024 Кулинарная книга. Все права защищены.</p>
  </div>
</footer>

<script src="js/moderation.js"></script>

</body>
</html>