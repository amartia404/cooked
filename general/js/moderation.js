(() => {
  // --- Данные и константы ---

  const STORAGE_KEY_RECIPES = "recipesData";
  const STORAGE_KEY_USERS = "usersData";
  const STORAGE_KEY_SESSION = "sessionUser";
  const STORAGE_KEY_INGREDIENTS = "ingredientsData";

  const categories = [
    { key: "", label: "Все" },
    { key: "мясо", label: "Мясо" },
    { key: "рыба", label: "Рыба" },
    { key: "веганское", label: "Веганское" },
    { key: "десерты", label: "Десерты" },
  ];

  const defaultIngredients = [
    "картофель", "морковь", "лук", "чеснок", "помидоры", "огурцы",
    "курица", "говядина", "свинина", "рыба", "масло", "соль",
    "перец", "сахар", "мука", "рис", "макароны", "яйца",
    "молоко", "сливки", "сметана", "зелень", "лавровый лист",
  ];

  // --- DOM элементы ---

  const categoryNav = document.getElementById("categoryNav");
  const ingredientsList = document.getElementById("ingredientsList");
  const newIngredientInput = document.getElementById("newIngredientInput");
  const btnAddNewIngredient = document.getElementById("btnAddNewIngredient");
  const sortContainer = document.querySelector(".sort-container");
  const main = document.getElementById("main");
  const recipesSection = document.getElementById("recipesSection");
  const recipeListSection = document.getElementById("recipeListSection");
  const modalOverlay = document.getElementById("modalOverlay");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const recipeForm = document.getElementById("recipeForm");
  const inputTitle = document.getElementById("inputTitle");
  const inputCookTime = document.getElementById("inputCookTime");
  const inputCategory = document.getElementById("inputCategory");
  const ingredientsContainer = document.getElementById("ingredientsContainer");
  const btnAddIngredient = document.getElementById("btnAddIngredient");
  const stepsContainer = document.getElementById("stepsContainer");
  const btnAddStep = document.getElementById("btnAddStep");
  const inputImageFile = document.getElementById("inputImageFile");
  const imagePreview = document.getElementById("imagePreview");
  const btnSubmitRecipe = document.getElementById("btnSubmitRecipe");
  const homeLink = document.getElementById("homeLink");

  const userNav = document.getElementById("userNav");
  const authModal = document.getElementById("authModal");
  const btnCloseAuthModal = document.getElementById("btnCloseAuthModal");
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const loginForm = document.getElementById("loginForm");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");
  const registerForm = document.getElementById("registerForm");
  const registerUsername = document.getElementById("registerUsername");
  const registerPassword = document.getElementById("registerPassword");
  const registerPasswordConfirm = document.getElementById("registerPasswordConfirm");

  const btnAction = document.getElementById("btnAction");

  // --- Добавим контейнер для кнопок сортировки рядом с заголовком "Рецепты" ---
  const sortNav = document.createElement("nav");
  sortNav.id = "sortNav";
  sortNav.setAttribute("aria-label", "Сортировка рецептов");
  sortNav.style.display = "flex";
  sortNav.style.gap = "15px";
  sortNav.style.fontWeight = "600";
  sortNav.style.fontSize = "14px";

  const h2Recipes = document.createElement("h2");
  h2Recipes.textContent = "Рецепты";

  const headerWrapper = document.createElement("div");
  headerWrapper.className = "recipes-header";

  headerWrapper.appendChild(h2Recipes);
  headerWrapper.appendChild(sortNav);

//   recipesSection.insertBefore(headerWrapper, recipeListSection);

  // --- Модальный просмотр рецепта ---

  const recipeViewModal = document.getElementById("recipeViewModal");
  const btnCloseRecipeView = document.getElementById("btnCloseRecipeView");
  const recipeViewTitle = document.getElementById("recipeViewTitle");
  const recipeViewImage = document.getElementById("recipeViewImage");
  const recipeViewCookTime = document.getElementById("recipeViewCookTime");
  const recipeViewCategory = document.getElementById("recipeViewCategory");
  const recipeViewIngredients = document.getElementById("recipeViewIngredients");
  const recipeViewSteps = document.getElementById("recipeViewSteps");
  const recipeViewRating = document.getElementById("recipeViewRating");

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

  function closeRecipeViewModal() {
    recipeViewModal.hidden = true;
  }

  // --- Состояние приложения ---

  let state = {
    recipes: [],
    users: [],
    currentUser: null,
    ingredients: [],
    category: "",
    sortBy: "",
    sortOrder: "none",
    includeIngredients: new Set(),
    excludeIngredients: new Set(),
    editingRecipeId: null,
    adminView: null,
  };

  const sortOptions = [
    { key: "relevance", label: "По релевантности" },
    { key: "popularity", label: "По популярности" },
    { key: "rating", label: "По рейтингу" },
    { key: "cookTime", label: "По времени" },
    { key: "title", label: "По названию" }
  ];

  // --- Утилиты ---

  function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  // --- Загрузка и сохранение данных ---

  function loadData() {
    const loadedRecipes = loadFromStorage(STORAGE_KEY_RECIPES);
    state.recipes = Array.isArray(loadedRecipes) ? loadedRecipes : [];

    const loadedUsers = loadFromStorage(STORAGE_KEY_USERS);
    state.users = Array.isArray(loadedUsers) ? loadedUsers : [];

    const loadedIngredients = loadFromStorage(STORAGE_KEY_INGREDIENTS);
    state.ingredients = Array.isArray(loadedIngredients) ? loadedIngredients : [...defaultIngredients];

    const sessionUser = loadFromStorage(STORAGE_KEY_SESSION);
    if (sessionUser && sessionUser.username) {
      const user = state.users.find(u => u.username === sessionUser.username);
      if (user) {
        state.currentUser = user;
      }
    }
  }

  function saveData() {
    saveToStorage(STORAGE_KEY_RECIPES, state.recipes);
    saveToStorage(STORAGE_KEY_USERS, state.users);
    saveToStorage(STORAGE_KEY_INGREDIENTS, state.ingredients);
    if (state.currentUser) {
      saveToStorage(STORAGE_KEY_SESSION, { username: state.currentUser.username });
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
  }

  // --- Пользователи ---

  function createUser(username, password, isAdmin = false) {
    if (state.users.find(u => u.username === username)) return false;
    state.users.push({ username, password, isAdmin, avatarDataUrl: "" });
    saveData();
    return true;
  }

  function checkLogin(username, password) {
    return state.users.find(u => u.username === username && u.password === password) || null;
  }

  function initUsers() {
    if (!state.users.find(u => u.isAdmin)) {
      createUser("admin", "admin123", true);
    }
  }

  // --- Рендер категорий ---

  function renderCategories() {
    categoryNav.innerHTML = "";
    categories.forEach(({ key, label }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "category-btn" + (state.category === key ? " active" : "");
      btn.textContent = label;
      btn.addEventListener("click", () => {
        if (state.category !== key) {
          state.category = key;
          updateCategoryActive();
          filterAndRenderRecipes();
        }
      });
      categoryNav.appendChild(btn);
    });
  }

  function updateCategoryActive() {
    [...categoryNav.children].forEach((btn, i) => {
      btn.classList.toggle("active", categories[i].key === state.category);
    });
  }

  // Функция для создания блока ingredientsFilter
  function createIngredientsFilter() {
    const ingredientsFilter = document.createElement("aside");
    ingredientsFilter.id = "ingredientsFilter";
    ingredientsFilter.setAttribute("aria-label", "Фильтр ингредиентов");

    const ingredientsList = document.createElement("ul");
    ingredientsList.id = "ingredientsList";
    ingredientsFilter.appendChild(ingredientsList);

    return ingredientsFilter;
  }

  // Функция для рендеринга фильтра ингредиентов
  function renderIngredientsFilter() {
    // Удаляем старый ingredientsFilter, если он существует
    const existingFilter = document.getElementById("ingredientsFilter");
    if (existingFilter) existingFilter.remove();

    // Создаем новый ingredientsFilter
    const ingredientsFilter = createIngredientsFilter();

    state.ingredients.forEach(ingredient => {
      const li = document.createElement("li");
      li.tabIndex = 0;
      li.setAttribute("role", "checkbox");
      let stateClass = "";
      let ariaChecked = false;

      if (state.includeIngredients.has(ingredient)) {
        stateClass = "include";
        ariaChecked = true;
      } else if (state.excludeIngredients.has(ingredient)) {
        stateClass = "exclude";
        ariaChecked = false;
      }

      li.className = stateClass;
      li.setAttribute("aria-checked", ariaChecked);
      li.setAttribute("aria-describedby", `desc-${ingredient}`);

      const checkboxSpan = document.createElement("span");
      checkboxSpan.className = "checkbox-custom";
      checkboxSpan.style.marginTop = "5px";
      checkboxSpan.innerHTML = `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <polyline points="3.5 8.5 6.5 11.5 12.5 5.5" />
        </svg>
      `;
      li.appendChild(checkboxSpan);

      const spanText = document.createElement("span");
      spanText.id = `desc-${ingredient}`;
      spanText.textContent = ingredient;
      li.appendChild(spanText);

      li.addEventListener("click", () => toggleIngredient(ingredient));
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleIngredient(ingredient);
        }
      });

      // Кнопка удаления ингредиента только для админов
      if (state.currentUser && state.currentUser.isAdmin) {
        const btnDelete = document.createElement("button");
        btnDelete.type = "button";
        btnDelete.className = "remove-ingredient-btn";
        btnDelete.title = `Удалить ингредиент ${ingredient}`;
        btnDelete.setAttribute("aria-label", `Удалить ингредиент ${ingredient}`);
        btnDelete.textContent = "×";
        btnDelete.addEventListener("click", () => {
          if (confirm(`Удалить ингредиент "${ingredient}"? Это удалит его из всех рецептов.`)) {
            removeIngredient(ingredient);
          }
        });
        li.appendChild(btnDelete);
      }

      // ingredientsList.appendChild(li);
    });

    // Если пользователь админ — создаём поле ввода и кнопку
    if (state.currentUser && state.currentUser.isAdmin) {
      const newIngredientInput = document.createElement("input");
      newIngredientInput.type = "text";
      newIngredientInput.id = "newIngredientInput";
      newIngredientInput.placeholder = "Новый ингредиент";
      newIngredientInput.setAttribute("aria-label", "Новый ингредиент");
      ingredientsFilter.appendChild(newIngredientInput);

      const btnAddNewIngredient = document.createElement("button");
      btnAddNewIngredient.id = "btnAddNewIngredient";
      btnAddNewIngredient.textContent = "Добавить ингредиент";
      ingredientsFilter.appendChild(btnAddNewIngredient);

      btnAddNewIngredient.addEventListener("click", () => {
        const val = newIngredientInput.value.trim().toLowerCase();
        if (!val) {
          alert("Введите название ингредиента");
          return;
        }
        if (state.ingredients.includes(val)) {
          alert("Такой ингредиент уже есть");
          return;
        }
        state.ingredients.push(val);
        saveData();
        renderIngredientsFilter();
        filterAndRenderRecipes();
        newIngredientInput.value = "";
      });
    }
  }

  // Вызов функции рендеринга ингредиентов
  renderIngredientsFilter();

  function toggleIngredient(ingredient) {
    if (!state.includeIngredients.has(ingredient) && !state.excludeIngredients.has(ingredient)) {
      state.includeIngredients.add(ingredient);
      state.excludeIngredients.delete(ingredient);
    } else if (state.includeIngredients.has(ingredient)) {
      state.includeIngredients.delete(ingredient);
      state.excludeIngredients.add(ingredient);
    } else {
      state.includeIngredients.delete(ingredient);
      state.excludeIngredients.delete(ingredient);
    }
    renderIngredientsFilter();
    filterAndRenderRecipes();
  }


  function removeIngredient(ingredient) {
    state.ingredients = state.ingredients.filter(i => i !== ingredient);
    state.recipes.forEach(r => {
      r.ingredients = r.ingredients.filter(i => i !== ingredient);
    });
    saveData();
    renderIngredientsFilter();
    filterAndRenderRecipes();
  }

  // --- Рендер кнопок сортировки ---

  function renderSortButtons() {
    sortNav.innerHTML = "";
    sortOptions.forEach(({ key, label }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.dataset.sortKey = key;
      btn.className = "";
      if (state.sortBy === key) {
        btn.classList.add("active");
      }
      btn.addEventListener("click", () => {
        if (state.sortBy !== key) {
          state.sortBy = key;
          state.sortOrder = "asc";
          renderSortButtons();
          filterAndRenderRecipes();
        }
      });
      sortNav.appendChild(btn);
    });
  }

  // --- Фильтрация и сортировка рецептов ---

  function filterAndRenderRecipes() {
    let filtered = state.recipes.filter(r => r.status === "approved");

    if (state.category) {
      filtered = filtered.filter(r => r.category === state.category);
    }

    if (state.includeIngredients.size > 0) {
      filtered = filtered.filter(r => {
        const recipeIngredientsLower = r.ingredients.map(i => i.toLowerCase());
        return [...state.includeIngredients].every(ing => recipeIngredientsLower.includes(ing.toLowerCase()));
      });
    }

    if (state.excludeIngredients.size > 0) {
      filtered = filtered.filter(r => {
        const recipeIngredientsLower = r.ingredients.map(i => i.toLowerCase());
        return [...state.excludeIngredients].every(ing => !recipeIngredientsLower.includes(ing.toLowerCase()));
      });
    }

    if (state.sortBy && state.sortOrder !== "none") {
      filtered = filtered.slice();

      if (state.sortBy === "cookTime") {
        filtered.sort((a, b) => a.cookTime - b.cookTime);
      } else if (state.sortBy === "title") {
        filtered.sort((a, b) => a.title.localeCompare(b.title, "ru"));
      } else if (state.sortBy === "rating") {
        filtered.sort((a, b) => {
          const aRating = averageRating(a.ratings);
          const bRating = averageRating(b.ratings);
          return bRating - aRating;
        });
      } else if (state.sortBy === "popularity") {
        filtered.sort((a, b) => b.ratings.length - a.ratings.length);
      } else if (state.sortBy === "relevance") {
        // Нет реализации релевантности
      }
    }

    // renderRecipes(filtered);
  }

  function averageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

function renderModerationRecipes() {
    const moderationList = document.getElementById("moderationList");
    moderationList.innerHTML = ""; // Очищаем предыдущий список

    // Убрали фильтр: state.recipes уже фильтруется сервером (только 'pending')
    const moderationRecipes = state.recipes;  // Используем напрямую
    console.log("Pending recipes from server:", moderationRecipes);

    if (moderationRecipes.length === 0) {
        // Если нет рецептов на модерации, выводим сообщение
        const message = document.createElement("p");
        message.textContent = "Нет рецептов на модерации.";
        moderationList.appendChild(message);
    } else {
        // Если есть рецепты на модерации, отображаем их
        moderationRecipes.forEach(recipe => {
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

            const pCookTime = document.createElement("p");
            pCookTime.innerHTML = `<b>Время готовки:</b> ${recipe.cookTime} мин`;
            infoDiv.appendChild(pCookTime);

            const pCategory = document.createElement("p");
            pCategory.innerHTML = `<b>Категория:</b> ${recipe.category || "—"}`;
            infoDiv.appendChild(pCategory);

            // Действия админа
            const actions = document.createElement("div");
            actions.className = "recipe-actions";

            const btnApprove = document.createElement("button");
            btnApprove.textContent = "Одобрить";
            btnApprove.addEventListener("click", () => handleApprove(recipe.id)); // Изменено на новую функцию
            actions.appendChild(btnApprove);

            const btnReject = document.createElement("button");
            btnReject.textContent = "Отклонить";
            btnReject.addEventListener("click", () => handleReject(recipe.id)); // Изменено на новую функцию
            actions.appendChild(btnReject);

            infoDiv.appendChild(actions);
            card.appendChild(infoDiv);
            moderationList.appendChild(card);
        });
    }
}

// Новые функции: обращаются к серверу, заменяют approveRecipe/rejectRecipe
async function handleApprove(id) {
    try {
        const response = await fetch('php/manageRecipe.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve', id })
        });
        const data = await response.json();
        if (data.success) {
            alert(data.message); // Или toast/notification
            fetchPendingRecipes();  // Перезагружаем список (удаляем одобренный из списка)
        } else {
            alert('Ошибка одобрения: ' + data.error);
        }
    } catch (err) {
        console.error('Ошибка одобрения:', err);
        alert('Ошибка сети');
    }
}

async function handleReject(id) {
    if (!confirm('Удалить рецепт навсегда? Эта операция необратима.')) return; // Подтверждение
    try {
        const response = await fetch('php/manageRecipe.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reject', id })
        });
        const data = await response.json();
        if (data.success) {
            alert(data.message); // Или toast/notification
            fetchPendingRecipes();  // Перезагружаем список (удаляем отклонённый)
        } else {
            alert('Ошибка отклонения: ' + data.error);
        }
    } catch (err) {
        console.error('Ошибка отклонения:', err);
        alert('Ошибка сети');
    }
}

  function approveRecipe(recipeId) {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (recipe) {
      recipe.status = "approved"; // Изменяем статус на одобренный
      saveData(); // Сохраняем изменения
      renderModerationRecipes(); // Обновляем список
      filterAndRenderRecipes(); // Обновляем основной список рецептов
    }
  }

  function rejectRecipe(recipeId) {
    const index = state.recipes.findIndex(r => r.id === recipeId);
    if (index !== -1) {
      state.recipes.splice(index, 1); // Удаляем рецепт
      saveData(); // Сохраняем изменения
      renderModerationRecipes(); // Обновляем список
    }
  }

  // --- Оценка рецепта ---

  function rateRecipe(recipeId, rating) {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    if (!recipe.userRatings) recipe.userRatings = {};
    recipe.userRatings[state.currentUser.username] = rating;

    recipe.ratings = Object.values(recipe.userRatings);

    saveData();
    filterAndRenderRecipes();
  }

  function deleteRecipe(recipeId) {
    const index = state.recipes.findIndex(r => r.id === recipeId);
    if (index === -1) return;

    state.recipes.splice(index, 1);

    saveData();

    renderMyRecipes();
    filterAndRenderRecipes();
  }

  // --- Форма добавления/редактирования рецепта ---

  function clearIngredientsInputs() {
    ingredientsContainer.innerHTML = "";
    addIngredientInput();
  }

  function addIngredientInput(value = "") {
    const div = document.createElement("div");
    div.className = "ingredient-row";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Ингредиент";
    input.value = value;
    input.required = true;
    input.autocomplete = "off";

    const btnRemove = document.createElement("button");
    btnRemove.type = "button";
    btnRemove.textContent = "×";
    btnRemove.title = "Удалить ингредиент";
    btnRemove.setAttribute("aria-label", "Удалить ингредиент");
    btnRemove.disabled = false;

    btnRemove.addEventListener("click", () => {
      if (ingredientsContainer.children.length > 1) {
        div.remove();
      }
    });

    div.appendChild(input);
    div.appendChild(btnRemove);
    ingredientsContainer.appendChild(div);

    updateRemoveButtonsState();
  }

  function updateRemoveButtonsState() {
    const btns = ingredientsContainer.querySelectorAll("button");
    if (btns.length === 1) {
      btns[0].disabled = true;
    } else {
      btns.forEach(btn => (btn.disabled = false));
    }
  }

  function clearStepsInputs() {
    stepsContainer.innerHTML = "";
    addStepInput();
  }

  function addStepInput(value = "") {
    const div = document.createElement("div");
    div.className = "step-row";

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Опишите шаг приготовления";
    textarea.value = value;
    textarea.required = true;
    textarea.rows = 3;

    const btnRemove = document.createElement("button");
    btnRemove.type = "button";
    btnRemove.textContent = "×";
    btnRemove.title = "Удалить шаг";
    btnRemove.setAttribute("aria-label", "Удалить шаг");

    btnRemove.addEventListener("click", () => {
      if (stepsContainer.children.length > 1) {
        div.remove();
      }
    });

    div.appendChild(textarea);
    div.appendChild(btnRemove);
    stepsContainer.appendChild(div);

    updateRemoveStepsButtonsState();
  }

  function updateRemoveStepsButtonsState() {
    const btns = stepsContainer.querySelectorAll("button");
    if (btns.length === 1) {
      btns[0].disabled = true;
    } else {
      btns.forEach(btn => (btn.disabled = false));
    }
  }

  // --- Открытие/закрытие модалки рецепта (редактирование/добавление) ---

  function openRecipeModal(editingRecipe = null) {
    modalOverlay.hidden = false;
    modalOverlay.scrollTop = 0;
    recipeForm.reset();
    clearIngredientsInputs();
    clearStepsInputs();
    btnSubmitRecipe.textContent = editingRecipe ? "Сохранить изменения" : "Добавить рецепт";
    state.editingRecipeId = null;
    imagePreview.style.display = "none";
    imagePreview.src = "";

    inputImageFile.value = ""; // Сброс поля выбора файла

    if (editingRecipe) {
      state.editingRecipeId = editingRecipe.id;
      inputTitle.value = editingRecipe.title;
      inputCookTime.value = editingRecipe.cookTime;
      inputCategory.value = editingRecipe.category || "";

      ingredientsContainer.innerHTML = "";
      if (editingRecipe.ingredients && editingRecipe.ingredients.length > 0) {
        editingRecipe.ingredients.forEach(ing => addIngredientInput(ing));
      } else {
        addIngredientInput();
      }

      stepsContainer.innerHTML = "";
      if (editingRecipe.steps && editingRecipe.steps.length > 0) {
        editingRecipe.steps.forEach(step => addStepInput(step));
      } else {
        addStepInput();
      }

      if (editingRecipe.imageUrl) {
        imagePreview.src = editingRecipe.imageUrl;
        imagePreview.style.display = "block";
      }
    } else {
      inputCategory.value = state.category || "";
    }

    inputTitle.focus();
  }

  function closeRecipeModal() {
    modalOverlay.hidden = true;
    state.editingRecipeId = null;
    recipeForm.reset();
    imagePreview.style.display = "none";
    imagePreview.src = "";
  }

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
    { id: "addRecipe", label: "Добавить рецепт/Модерация" }, // новая кнопка
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
  userNav.style.position = "relative";

  function updateAvatarBtn(user) {
    if (user && user.avatar) {  // Изменено с avatarDataUrl
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
    toggleUserMenu();
  });

  userMenu.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    e.stopPropagation();
    const id = e.target.id.replace("userMenu_", "");
    toggleUserMenu();

    if (id === "profile")
			{
				window.location.href = "profile.php";
			}
		else if (id === "myRecipes")
			{
				window.location.href = "MyRecipes.php";
			}
		else if (id === "addRecipe")
			{
				if (state.currentUser && state.currentUser.isAdmin){
					window.location.href = "moderation.php";}
					else {openRecipeModal();}}
					else if (id === "logout")
						{
							logoutUser();
						}
  });

	async function fetchPendingRecipes() {
  try {
		const response = await fetch('php/getPendingRecipes.php');
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status} (${response.statusText}): ${errorText}`);
    }
    const data = await response.json();
		console.log("Raw API response:", data);
		console.log("Recipes array:", data.recipes);
		console.log("Pending recipes count:", Array.isArray(data.recipes) ? data.recipes.filter(r => r.status === "pending").length : 0);

    if (data.success && Array.isArray(data.recipes)) {
      state.recipes = data.recipes;
    } else {
      console.error("Ошибка в данных рецептов:", data.error || data);
      state.recipes = [];  // Если нет данных, пустой массив
    }
  } catch (err) {
    console.error("Не удалось загрузить рецепты", err);
    state.recipes = [];  // Пустой массив при ошибке
  }
}

  const profileSection = document.getElementById("profileSection");
  const profileFormSection = document.getElementById("profileFormSection");
  const profileUsernameSection = document.getElementById("profileUsernameSection");
  const profileAvatarInputSection = document.getElementById("profileAvatarInputSection");
  const profileAvatarPreviewSection = document.getElementById("profileAvatarPreviewSection");

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
        updateAdminNav();
        renderIngredientsFilter();
        filterAndRenderRecipes();
  
        alert('Вы успешно вышли из аккаунта.');
      } else {
        alert('Не удалось выйти из аккаунта: ' + (data.message || "Ошибка сервера"));
      }
    } catch (error) {
      console.error('Ошибка при logout:', error);
      alert('Ошибка соединения. Попробуйте позже.');
    }
  }

  // --- Обновление навигации пользователя ---

  function updateUserNav() {
    userNav.innerHTML = "";
    if (state.currentUser) {
      updateAvatarBtn(state.currentUser);
      userNav.appendChild(avatarBtn);
    } else {
      avatarBtn.style.backgroundImage = "";
      avatarBtn.classList.add("no-avatar");
      avatarBtn.setAttribute("aria-expanded", "false");
      avatarBtn.classList.remove("show");
      if (avatarBtn.parentNode) avatarBtn.parentNode.removeChild(avatarBtn);

      userNav.appendChild(avatarBtn);
    }
  }

  // --- Обновление кнопки и интерфейса админа ---

  function updateAdminNav() {
    const btnAction = document.getElementById("userMenu_addRecipe");
    if (state.currentUser && state.currentUser.isAdmin) {
      btnAction.textContent = "Модерация";
    } else {
      btnAction.textContent = "Добавить рецепт";
    }
  }


  // --- Инициализация ---

	async function init() {
  state.currentUser = window._CURRENT_USER || null;

  await fetchPendingRecipes()
	renderModerationRecipes();

  // Рендерим интерфейс после загрузки всех данных
  updateUserNav();
  updateAdminNav();
  renderCategories();
  renderIngredientsFilter();
  filterAndRenderRecipes();  // Теперь рецепты загружены, так что фильтрация и рендеринг пройдут
}

  init();
})();