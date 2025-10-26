"use strict";
(() => {

  // Элементы DOM
  const recipeViewModal = document.getElementById("recipeViewModal");
  const btnCloseRecipeView = document.getElementById("btnCloseRecipeView");
  const recipeViewTitle = document.getElementById("recipeViewTitle");
  const recipeViewImage = document.getElementById("recipeViewImage");
  const recipeViewCookTime = document.getElementById("recipeViewCookTime");
  const recipeViewCategory = document.getElementById("recipeViewCategory");
  const recipeViewAuthor = document.getElementById("recipeViewAuthor");
  const recipeViewIngredients = document.getElementById("recipeViewIngredients");
  const recipeViewSteps = document.getElementById("recipeViewSteps");
  const recipeListSection = document.querySelector(".recipe-list-section");

  const authModal = document.getElementById("authModal");
  const btnCloseAuthModal = document.getElementById("btnCloseAuthModal");
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const userNav = document.getElementById("userNav");
  const avatarBtn = document.querySelector('.user-avatar-btn');
  const userMenu = document.querySelector('.user-menu');

  // Состояние
  let state = {
    currentUser: window._CURRENT_USER || null,
    recipes: window._USER_RECIPES || []
  };

  // Отрисовка карточек рецептов
  function renderRecipes(recipes) {
    recipeListSection.innerHTML = "";

    if (recipes.length === 0) {
      const p = document.createElement("p");
      p.textContent = "Рецепты не найдены";
      recipeListSection.appendChild(p);
      return;
    }

    recipes.forEach(recipe => {
      const card = document.createElement("article");
      card.className = "recipe-card";
      card.tabIndex = 0;
      card.setAttribute("aria-label", `Рецепт ${recipe.title}`);

      if (recipe.image_url) {
        const img = document.createElement("img");
        img.src = recipe.image_url;
        img.alt = `Фото рецепта ${recipe.title}`;
        img.style.width = "100%";
        img.style.height = "180px";
        img.style.objectFit = "cover";
        img.style.borderBottom = "1px solid #ddd";
        card.appendChild(img);
      }

      const infoDiv = document.createElement("div");
      infoDiv.className = "recipe-info";

      const h3 = document.createElement("h3");
      h3.className = "recipe-name";
      h3.textContent = recipe.title;
      infoDiv.appendChild(h3);

      const metaDiv = document.createElement("div");
      metaDiv.className = "recipe-meta";

      const pCookTime = document.createElement("p");
      pCookTime.innerHTML = `<b>Время готовки:</b> ${recipe.cook_time} мин`;
      metaDiv.appendChild(pCookTime);

      if (recipe.category) {
        const pCategory = document.createElement("p");
        pCategory.innerHTML = `<b>Категория:</b> ${recipe.category}`;
        metaDiv.appendChild(pCategory);
      }

      infoDiv.appendChild(metaDiv);
      card.appendChild(infoDiv);

      card.addEventListener("click", () => openRecipeViewModal(recipe));
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openRecipeViewModal(recipe);
        }
      });

      recipeListSection.appendChild(card);
    });
  }

  // Открытие модального окна рецепта
  function openRecipeViewModal(recipe) {
    if (!recipe) return;

    recipeViewTitle.textContent = recipe.title || "Без названия";

    if (recipe.image_url) {
      recipeViewImage.src = recipe.image_url;
      recipeViewImage.alt = `Фото рецепта ${recipe.title}`;
      recipeViewImage.style.display = "block";
    } else {
      recipeViewImage.style.display = "none";
      recipeViewImage.src = "";
      recipeViewImage.alt = "";
    }

    recipeViewCookTime.textContent = recipe.cook_time || "—";
    recipeViewCategory.textContent = recipe.category || "—";

    // if (recipeViewAuthor) {
    //   recipeViewAuthor.textContent = recipe.author || "Неизвестный Автор";
    //   recipeViewAuthor.href = 'user.php?id=' + (recipe.author_id || '');
    //   recipeViewAuthor.title = `Профиль ${recipe.author || 'автора'}`;
    //   if (!recipe.author_id) {
    //     recipeViewAuthor.href = '#';
    //     recipeViewAuthor.style.pointerEvents = 'none';
    //   }
    // }

    recipeViewIngredients.innerHTML = "";
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach(ing => {
        const li = document.createElement("li");
        li.textContent = ing;
        recipeViewIngredients.appendChild(li);
      });
    } else {
      recipeViewIngredients.textContent = "Ингредиенты не указаны";
    }

    recipeViewSteps.innerHTML = "";
    if (recipe.steps && Array.isArray(recipe.steps)) {
      recipe.steps.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        recipeViewSteps.appendChild(li);
      });
    } else {
      recipeViewSteps.textContent = "Шаги приготовления не указаны";
    }

    recipeViewModal.hidden = false;
    recipeViewModal.focus();
  }

  // Закрытие модального окна рецепта
  function closeRecipeViewModal() {
    recipeViewModal.hidden = true;
  }

  btnCloseRecipeView.addEventListener("click", closeRecipeViewModal);
  recipeViewModal.addEventListener("click", e => {
    if (e.target === recipeViewModal) closeRecipeViewModal();
  });
  document.addEventListener("keydown", e => {
    if (!recipeViewModal.hidden && e.key === "Escape") {
      closeRecipeViewModal();
    }
  });

  // Модальное окно аутентификации
  function openAuthModal(tab = "login") {
    authModal.hidden = false;
    if (tab === "login") showLoginTab();
    else showRegisterTab();
  }

  function closeAuthModal() {
    authModal.hidden = true;
    loginForm.reset();
    registerForm.reset();
  }

  btnCloseAuthModal.addEventListener("click", closeAuthModal);

  authModal.addEventListener("click", e => {
    if (e.target === authModal) closeAuthModal();
  });

  tabLogin.addEventListener("click", showLoginTab);
  tabRegister.addEventListener("click", showRegisterTab);

  function showLoginTab() {
    tabLogin.classList.add("active");
    tabLogin.setAttribute("aria-selected", "true");
    tabRegister.classList.remove("active");
    tabRegister.setAttribute("aria-selected", "false");
    loginForm.hidden = false;
    registerForm.hidden = true;
    document.querySelector('#loginForm input[name="email"]')?.focus();
  }

  function showRegisterTab() {
    tabRegister.classList.add("active");
    tabRegister.setAttribute("aria-selected", "true");
    tabLogin.classList.remove("active");
    tabLogin.setAttribute("aria-selected", "false");
    registerForm.hidden = false;
    loginForm.hidden = true;
    document.querySelector('#registerForm input[name="username"]')?.focus();
  }

  // Обработка форм входа и регистрации (аналогично script.js)
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('php/login.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        state.currentUser = data.user;
        updateUserNav();
        alert('Вход выполнен успешно');
        closeAuthModal();
      } else {
        alert(data.error || 'Ошибка авторизации');
      }
    } catch (error) {
      console.error('Ошибка при входе', error);
      alert('Ошибка сети. Попробуйте позже.');
    }
  });

  registerForm.addEventListener('submit', async event => {
    event.preventDefault();

    const formData = new FormData(registerForm);

    try {
      const response = await fetch(registerForm.action, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        window._CURRENT_USER = {
          username: result.user.username,
          email: result.user.email,
          isAdmin: false,
          avatar: ''
        };
        closeAuthModal();
        updateUserUIAfterLogin(window._CURRENT_USER);
      } else {
        alert('Ошибка: ' + result.message);
      }
    } catch (e) {
      alert('Ошибка сети');
      console.error(e);
    }
  });

  // Навигация пользователя
  function updateUserNav() {
    avatarBtn.style.display = "block";

    if (state.currentUser) {
      avatarBtn.style.backgroundImage = `url(${state.currentUser.avatar})`;
      avatarBtn.classList.add("has-avatar");
      avatarBtn.classList.remove("no-avatar");
    } else {
      avatarBtn.style.backgroundImage = "";
      avatarBtn.classList.add("no-avatar");
      avatarBtn.classList.remove("has-avatar");
    }
  }

  function toggleUserMenu() {
    const isExpanded = avatarBtn.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      avatarBtn.setAttribute("aria-expanded", "false");
      userMenu.classList.remove("show");
    } else {
      avatarBtn.setAttribute("aria-expanded", "true");
      userMenu.classList.add("show");
    }
  }

  avatarBtn.addEventListener("click", () => {
    if (!state.currentUser) {
      openAuthModal("login");
      return;
    }
    toggleUserMenu();
  });

  userMenu.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    e.stopPropagation();
    const id = e.target.id.replace("userMenu_", "");
    toggleUserMenu();

    if (!state.currentUser && id !== "logout") {
      openAuthModal("login");
      return;
    }

    if (id === "profile") {
      window.location.href = "profile.php";
    } else if (id === "myRecipes") {
      window.location.href = "MyRecipes.php";
    } else if (id === "addRecipe") {
      window.location.href = "index.php?openModal=addRecipe";
    } else if (id === "logout") {
      logoutUser();
    }
  });

  // Логаут (аналогично script.js)
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
        updateUserNav();
        alert('Вы successfully вышли из аккаунта.');
      } else {
        alert('Не удалось выйти из аккаунта: ' + (data.message || "Ошибка сервера"));
      }
    } catch (error) {
      console.error('Ошибка при logout:', error);
      alert('Ошибка соединения. Попробуйте позже.');
    }
  }

  // После входа обновляем UI
  function updateUserUIAfterLogin(user) {
    if (!user) return;
    state.currentUser = user;
    updateUserNav();
    closeAuthModal();
    console.log(`Пользователь вошел: ${user.username}`);
  }

  // Инициализация
  function init() {
    updateUserNav();
    renderRecipes(state.recipes);
  }

  init();
})();