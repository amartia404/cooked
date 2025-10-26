"use strict";
(() => {
  // Константы для localStorage (оставлены, если используются в user-related функциях, но в profile.php не критичны)
  const STORAGE_KEY_USERS = "usersData";
  const STORAGE_KEY_SESSION = "sessionUser";

  // Элементы DOM, релевантные для profile.php (user nav и связанные)
  const userNav = document.getElementById("userNav");

  // Состояние, релевантное только для пользователя (убраны recipes, ingredients и т.д.)
  let state = {
    currentUser: null,
  };

  // Функция для создания аватар-кнопки и меню (используется в updateUserNav)
  const avatarBtn = document.createElement("button");
  avatarBtn.className = "user-avatar-btn no-avatar";
  avatarBtn.setAttribute("aria-haspopup", "true");
  avatarBtn.setAttribute("aria-expanded", "false");
  avatarBtn.setAttribute("aria-label", "Меню пользователя");
  avatarBtn.type = "button";

  const userMenu = document.createElement("div");
  userMenu.className = "user-menu";
  userMenu.setAttribute("role", "menu");

  const menuItems = [
    { id: "profile", label: "Личный кабинет" },
    { id: "myRecipes", label: "Мои рецепты" },
    { id: "addRecipe", label: "Добавить рецепт" },
    { id: "logout", label: "Выйти" },
  ];

  menuItems.forEach(({ id, label }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.id = `userMenu_${id}`;
    btn.setAttribute("role", "menuitem");
    userMenu.appendChild(btn);
  });

  avatarBtn.appendChild(userMenu);
  if (userNav) {
    userNav.style.position = "relative";
  }

  // Функция обновления аватар-кнопки
  function updateAvatarBtn(user) {
    if (user && user.avatar) {
      avatarBtn.style.backgroundImage = `url(${user.avatar})`;  // Изменено с avatarDataUrl на avatar
      avatarBtn.classList.remove("no-avatar");
      avatarBtn.classList.add("has-avatar");
    } else {
      avatarBtn.style.backgroundImage = "";  // Очистка фонового изображения
      avatarBtn.classList.add("no-avatar");
      avatarBtn.classList.remove("has-avatar");
    }
  }

  // Функция переключения меню пользователя
  function toggleUserMenu() {
    const isExpanded = avatarBtn.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      avatarBtn.setAttribute("aria-expanded", "false");
      userMenu.classList.remove("show");
      document.removeEventListener("click", onClickOutsideMenu);
      document.removeEventListener("keydown", onEscPress);
    } else {
      avatarBtn.setAttribute("aria-expanded", "true");
      userMenu.classList.add("show");
      document.addEventListener("click", onClickOutsideMenu);
      document.addEventListener("keydown", onEscPress);
    }
  }

  // Обработчики для закрытия меню
  function onClickOutsideMenu(e) {
    if (!userNav.contains(e.target)) {
      toggleUserMenu();
    }
  }

  function onEscPress(e) {
    if (e.key === "Escape") {
      toggleUserMenu();
      avatarBtn.focus();
    }
  }

  // Обработчик клика на аватар-кнопку (в profile.php пользователь уже авторизован)
  avatarBtn.addEventListener("click", () => {
    toggleUserMenu();
  });

  // Обработчик кликов в меню
  userMenu.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    e.stopPropagation();
    const id = e.target.id.replace("userMenu_", "");
    toggleUserMenu();

    if (id === "profile") {
      window.location.href = "profile.php";
    } else if (id === "myRecipes") {
      window.location.href = "MyRecipes.php"; // Или MyRecipes.php, в зависимости от структуры
    } else if (id === "addRecipe") {
      // Изменено: перенаправление с параметром для открытия модального окна
      window.location.href = "index.php?openModal=addRecipe";
    } else if (id === "logout") {
      logoutUser();
    }
  });

  // Функция обновления навигации пользователя
  function updateUserNav() {
    if (!userNav) return;
    userNav.innerHTML = "";
    if (state.currentUser) {
      updateAvatarBtn(state.currentUser);
      userNav.appendChild(avatarBtn);
    } else {
      // Fallback для неавторизованного (но в profile.php это не должно происходить)
      updateAvatarBtn(null);
      userNav.appendChild(avatarBtn);
    }
  }

  // Функция выхода из аккаунта (релевантна для profile.php)
  async function logoutUser() {
    try {
      const response = await fetch('php/logout.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        state.currentUser = null;
        updateAvatarBtn(null);
        updateUserNav();
        alert('Вы успешно вышли из аккаунта.');
        window.location.href = 'index.php'; // Перенаправление после logout
      } else {
        alert('Не удалось выйти из аккаунта: ' + (data.message || "Ошибка сервера"));
      }
    } catch (error) {
      console.error('Ошибка при logout:', error);
      alert('Ошибка соединения. Попробуйте позже.');
    }
  }

  // Функция обновления UI после логина (может быть полезна, если перезагрузка)
  function updateUserUIAfterLogin(user) {
    if (!user) return;
    state.currentUser = user;
    updateUserNav();
    console.log(`Пользователь вошел: ${user.username}`);
  }

  // Инициализация (только user-related; убрать fetch для рецептов и т.д.)
  // В profile.php можно установить window._CURRENT_USER через PHP echo, но здесь fallback на null
  async function init() {
    // Предполагаем, что в profile.php PHP устанавливает window._CURRENT_USER
    // Пример: echo "<script>window._CURRENT_USER = {username: '{$user['username']}', avatarDataUrl: " . ($user['avatar'] ? "'{$user['avatar']}'" : 'null') . "};</script>";
    state.currentUser = window._CURRENT_USER || null;
    updateUserNav();
    updateAvatarBtn(state.currentUser);  // Добавьте вызов здесь, если нужно
  }

  init();
})();
