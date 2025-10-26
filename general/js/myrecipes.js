"use strict";

(() => {
  // Элементы DOM для рецептов
  const myRecipesList = document.getElementById("myRecipesList");

  // Элементы DOM для модального окна рецепта
  const recipeViewModal = document.getElementById("recipeViewModal");
  const btnCloseRecipeView = document.getElementById("btnCloseRecipeView");
  const recipeViewTitle = document.getElementById("recipeViewTitle");
  const recipeViewImage = document.getElementById("recipeViewImage");
  const recipeViewCookTime = document.getElementById("recipeViewCookTime");
  const recipeViewCategory = document.getElementById("recipeViewCategory");
  const recipeViewAuthor = document.getElementById("recipeViewAuthor");
  const recipeViewIngredients = document.getElementById("recipeViewIngredients");
  const recipeViewSteps = document.getElementById("recipeViewSteps");
  const recipeViewRating = document.getElementById("recipeViewRating");

  // Элементы DOM для меню пользователя
  const userNav = document.getElementById("userNav");
  const avatarBtn = document.querySelector('.user-avatar-btn');
  const userMenu = document.querySelector('.user-menu');

  let currentUser = null;  // Текущий пользователь
  let myRecipes = [];  // Массив рецептов пользователя

  // Функция для загрузки рецептов пользователя
  async function fetchMyRecipes() {
    if (!currentUser || !currentUser.username) {
      console.warn("Пользователь не авторизован или данные отсутствуют.");
      renderMyRecipes();  // Показать пустой список
      return;
    }
    try {
      const response = await fetch(`php/getMyRecipes.php`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.recipes)) {
        myRecipes = data.recipes;
        renderMyRecipes();
      } else {
        console.error("Ошибка в данных рецептов:", data.error || data);
        myRecipes = [];
        renderMyRecipes();
      }
    } catch (err) {
      console.error("Не удалось загрузить рецепты:", err);
      alert("Ошибка загрузки ваших рецептов. Попробуйте позже.");
      renderMyRecipes();
    }
  }

  // Функция для рендеринга рецептов
  function renderMyRecipes() {
    myRecipesList.innerHTML = "";

    if (myRecipes.length === 0) {
      const p = document.createElement("p");
      p.textContent = "У вас пока нет рецептов.";
      myRecipesList.appendChild(p);
      return;
    }

    myRecipes.forEach(recipe => {
      const card = document.createElement("article");
      card.className = "recipe-card";
      card.tabIndex = 0;
      card.setAttribute("aria-label", `Рецепт ${recipe.title}`);

      if (recipe.imageUrl) {
        const img = document.createElement("img");
        img.src = recipe.imageUrl;
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
      pCookTime.innerHTML = `<b>Время готовки:</b> ${recipe.cookTime} мин`;
      metaDiv.appendChild(pCookTime);

      if (recipe.category) {
        const pCategory = document.createElement("p");
        pCategory.innerHTML = `<b>Категория:</b> ${recipe.category}`;
        metaDiv.appendChild(pCategory);
      }

      const avgRating = averageRating(recipe.ratings || []);
      const rating = document.createElement("p");
      rating.textContent = `Рейтинг: ${avgRating.toFixed(2)} (${(recipe.ratings || []).length} голосов)`;
      metaDiv.appendChild(rating);

      infoDiv.appendChild(metaDiv);
      card.appendChild(infoDiv);

      // Обработка клика на карточку
      card.style.cursor = "pointer";
      card.addEventListener("click", () => openRecipeViewModal(recipe));
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openRecipeViewModal(recipe);
        }
      });

      myRecipesList.appendChild(card);
    });
  }

  // Вспомогательная функция для среднего рейтинга
  function averageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  // Функция для открытия модального окна рецепта
  function openRecipeViewModal(recipe) {
    if (!recipe) return;

    recipeViewTitle.textContent = recipe.title || "Без названия";

    if (recipe.imageUrl) {
      recipeViewImage.src = recipe.imageUrl;
      recipeViewImage.alt = `Фото рецепта ${recipe.title}`;
      recipeViewImage.style.display = "block";
    } else {
      recipeViewImage.style.display = "none";
      recipeViewImage.src = "";
      recipeViewImage.alt = "";
    }

    recipeViewCookTime.textContent = recipe.cookTime || "—";
    recipeViewCategory.textContent = recipe.category || "—";
    recipeViewAuthor.textContent = recipe.author || "Неизвестный Автор";
    recipeViewAuthor.href = recipe.author_id ? `user/${recipe.author_id}` : "#";

    recipeViewIngredients.innerHTML = "";
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ing => {
        const li = document.createElement("li");
        li.textContent = ing;
        recipeViewIngredients.appendChild(li);
      });
    } else {
      recipeViewIngredients.textContent = "Ингредиенты не указаны";
    }

    recipeViewSteps.innerHTML = "";
    if (recipe.steps && recipe.steps.length > 0) {
      recipe.steps.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        recipeViewSteps.appendChild(li);
      });
    } else {
      recipeViewSteps.textContent = "Шаги приготовления не указаны";
    }

    const avgRating = averageRating(recipe.ratings);
    recipeViewRating.textContent = `Рейтинг: ${avgRating.toFixed(2)} (${(recipe.ratings || []).length} голосов)`;

    recipeViewModal.hidden = false;
    recipeViewModal.focus();
  }

  // Функция для закрытия модального окна рецепта
  function closeRecipeViewModal() {
    recipeViewModal.hidden = true;
  }

  // Обработчики для закрытия модального окна рецепта
  btnCloseRecipeView.addEventListener("click", closeRecipeViewModal);
  recipeViewModal.addEventListener("click", e => {
    if (e.target === recipeViewModal) closeRecipeViewModal();
  });
  document.addEventListener("keydown", e => {
    if (!recipeViewModal.hidden && e.key === "Escape") {
      closeRecipeViewModal();
    }
  });

  // Функции для меню пользователя (адаптировано из общего script.js)
  function updateAvatarBtn(user) {
    if (user && user.avatar) {
      avatarBtn.style.backgroundImage = `url(${user.avatar})`;
      avatarBtn.classList.remove("no-avatar");
      avatarBtn.classList.add("has-avatar");
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
      document.removeEventListener("click", onClickOutsideMenu);
      document.removeEventListener("keydown", onEscPress);
    } else {
      avatarBtn.setAttribute("aria-expanded", "true");
      userMenu.classList.add("show");
      document.addEventListener("click", onClickOutsideMenu);
      document.addEventListener("keydown", onEscPress);
    }
  }

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

  avatarBtn.addEventListener("click", () => {
    if (!currentUser) {
      alert("Пожалуйста, войдите в систему.");
      return;
    }
    toggleUserMenu();
  });

  userMenu.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    e.stopPropagation();
    const id = e.target.id.replace("userMenu_", "");
    toggleUserMenu();

    if (!currentUser && id !== "logout") {
      alert("Пожалуйста, войдите в систему.");
      return;
    }

    if (id === "profile") {
      window.location.href = "profile.php";
    } else if (id === "myRecipes") {
      window.location.href = "MyRecipes.php";
    } else if (id === "addRecipe") {
      if (currentUser && currentUser.isAdmin) {
        window.location.href = "moderation.php";
      } else if (currentUser) {
        // Перенаправить на главную с параметром для открытия модального окна
        window.location.href = "index.php?openModal=addRecipe";
      } else {
        alert("Добавление рецепта доступно после входа.");
      }
    } else if (id === "logout") {
      logoutUser();
    }
  });

  async function logoutUser() {
    try {
      const response = await fetch('php/logout.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.success) {
      currentUser = null;
      updateAvatarBtn(null);
      updateUserNav();
      updateAdminNav();
      alert('Вы успешно вышли из аккаунта.');
      window.location.reload();  // Обновить страницу для сброса состояния
    } else {
      alert('Не удалось выйти из аккаунта: ' + (data.message || "Ошибка сервера"));
    }
  } catch (error) {
    console.error('Ошибка при logout:', error);
    alert('Ошибка соединения. Попробуйте позже.');
  }
}

  function updateUserNav() {
    avatarBtn.style.display = "block";

    if (currentUser) {
      updateAvatarBtn(currentUser);
      avatarBtn.classList.add("has-avatar");
    } else {
      updateAvatarBtn(null);
      avatarBtn.classList.remove("has-avatar");
      avatarBtn.classList.add("no-avatar");
    }
  }

  function updateAdminNav() {
    const btnAction = document.getElementById("userMenu_addRecipe");
    if (!btnAction) return;

    if (currentUser && currentUser.isAdmin) {
      btnAction.textContent = "Модерация";
    } else {
      btnAction.textContent = "Добавить рецепт";
    }
  }

  // Инициализация
  async function init() {
    currentUser = window._CURRENT_USER || null;
    updateUserNav();
    updateAdminNav();
    await fetchMyRecipes();
  }

  // Запуск инициализации при загрузке DOM
  document.addEventListener("DOMContentLoaded", init);
})();
