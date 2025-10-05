"use strict";
(() => {

  const STORAGE_KEY_RECIPES = "recipesData";
  const STORAGE_KEY_USERS = "usersData";
  const STORAGE_KEY_SESSION = "sessionUser";
  const STORAGE_KEY_INGREDIENTS = "ingredientsData";

async function fetchCategories() {
  try {
    const response = await fetch('php/getCategories.php');
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status} (${response.statusText}): ${errorText}`);
    }
    const data = await response.json();
    if (data.success && Array.isArray(data.categories)) {
      state.categories = data.categories;
      renderCategories();
    } else {
      console.error("Ошибка в данных категорий:", data.error || data);
    }
  } catch (err) {
    console.error("Не удалось загрузить категории", err);
  }
}

async function fetchIngredients() {
  try {
    const response = await fetch('php/getIngredients.php');
    const data = await response.json();
    if (data.success && Array.isArray(data.ingredients)) {
      state.ingredients = data.ingredients;
    } else {
      console.error("Ошибка загрузки ингредиентов:", data.error || data);
    }
  } catch (err) {
    console.error("Не удалось загрузить ингредиенты", err);
  }
}

async function fetchApprovedRecipes() {
  try {
    const response = await fetch('php/getApprovedRecipes.php');
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status} (${response.statusText}): ${errorText}`);
    }
    const data = await response.json();
    if (data.success && Array.isArray(data.recipes)) {
      state.recipes = data.recipes;
    } else {
      console.error("Ошибка в данных рецептов:", data.error || data);
      state.recipes = [];
    }
  } catch (err) {
    console.error("Не удалось загрузить рецепты", err);
    state.recipes = [];
  }
}

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
        updateAdminNav();
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

  const loginEmailInput = document.querySelector('#loginForm input[name="email"]');
  const loginPassword = document.getElementById("loginPassword");
  const registerForm = document.getElementById('registerForm');

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
          avatarDataUrl: ''
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
  
  const registerUsername = document.querySelector('#registerForm input[name="username"]');
  const registerPassword = document.getElementById("registerPassword");
  const registerPasswordConfirm = document.getElementById("registerPasswordConfirm");

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

  btnCloseRecipeView.addEventListener("click", closeRecipeViewModal);
  recipeViewModal.addEventListener("click", e => {
    if (e.target === recipeViewModal) closeRecipeViewModal();
  });
  document.addEventListener("keydown", e => {
    if (!recipeViewModal.hidden && e.key === "Escape") {
      closeRecipeViewModal();
    }
  });

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

function renderCategories() {
  categoryNav.innerHTML = "";

  if (!state.categories || !Array.isArray(state.categories)) {
    console.warn("Categories not loaded yet, falling back to empty list.");
    return;
  }
  
  state.categories.forEach(({ key, label }) => {
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
      btn.classList.toggle("active", state.categories[i].key === state.category);
    });
  }

  function createIngredientsFilter() {
    const ingredientsFilter = document.createElement("aside");
    ingredientsFilter.id = "ingredientsFilter";
    ingredientsFilter.setAttribute("aria-label", "Фильтр ингредиентов");

    const ingredientsList = document.createElement("ul");
    ingredientsList.id = "ingredientsList";
    ingredientsFilter.appendChild(ingredientsList);

    return ingredientsFilter;
  }

  function renderIngredientsFilter() {
    const existingFilter = document.getElementById("ingredientsFilter");
    if (existingFilter) existingFilter.remove();

    const ingredientsFilter = createIngredientsFilter();

    const container = document.getElementById("ingredientsColumn");
    container.appendChild(ingredientsFilter);

    const ingredientsList = document.getElementById("ingredientsList");
    ingredientsList.innerHTML = "";

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

      if (state.currentUser  && state.currentUser .isAdmin) {
        const btnDelete = document.createElement("button");
        btnDelete.type = "button";
        btnDelete.className = "remove-ingredient-btn";
        btnDelete.title = `Удалить ингредиент ${ingredient}`;
        btnDelete.setAttribute("aria-label", `Удалить ингредиент ${ingredient}`);
        btnDelete.textContent = "×";
        btnDelete.addEventListener("click", (event) => {
          event.stopPropagation();
          if (confirm(`Удалить ингредиент "${ingredient}"? Это удалит его из всех рецептов.`)) {
            removeIngredient(ingredient);
          }
        });
        li.appendChild(btnDelete);
      }

      ingredientsList.appendChild(li);
    });

    async function removeIngredient(ingredient) {
      try {
        const response = await fetch('php/getIngredients.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ action: 'delete', name: ingredient }),
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          alert(data.message);
          await fetchIngredients();
          renderIngredientsFilter();
          filterAndRenderRecipes();
        } else {
          alert(data.error || 'Ошибка при удалении ингредиента');
        }
      } catch (error) {
        alert('Ошибка сети или сервера');
        console.error(error);
      }
    }

    if (state.currentUser  && state.currentUser .isAdmin) {
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

      btnAddNewIngredient.addEventListener("click", async () => {
        const val = newIngredientInput.value.trim().toLowerCase();
        if (!val) {
          alert("Введите название ингредиента");
          return;
        }
        if (state.ingredients.includes(val)) {
          alert("Такой ингредиент уже есть");
          return;
        }

        try {
          const response = await fetch('php/getIngredients.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ action: 'add', name: val }),
            credentials: 'include'
          });
          const data = await response.json();
          if (data.success) {
            alert(data.message);
            await fetchIngredients();
            renderIngredientsFilter();
          } else {
            alert(data.error || 'Ошибка при добавлении ингредиента');
          }
        } catch (error) {
          alert('Ошибка сети или сервера');
          console.error(error);
        }

        newIngredientInput.value = "";
      });
    }
  }

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
    renderIngredientsFilter();
    filterAndRenderRecipes();
  }

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

  function filterAndRenderRecipes() {
    let filtered = state.recipes;

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
      }
    }

    renderRecipes(filtered);
  }

  function averageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  function renderRecipes(recipes) {
    let existingH2 = recipesSection.querySelector("h2");
    if (!existingH2) {
      existingH2 = document.createElement("h2");
      existingH2.textContent = "Рецепты";
      recipesSection.insertBefore(existingH2, recipeListSection);
    }

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
        pCategory.innerHTML = `<b>Категория:</b> ${recipe.category || "—"}`;
        metaDiv.appendChild(pCategory);
      }

      const avgRating = averageRating(recipe.ratings);
      const ratingDiv = document.createElement("p");
      ratingDiv.textContent = `Рейтинг: ${avgRating.toFixed(2)} (${recipe.ratings.length} голосов)`;
      metaDiv.appendChild(ratingDiv);

      infoDiv.appendChild(metaDiv);

      if (state.currentUser && !state.currentUser.isAdmin) {
        const userRatingDiv = document.createElement("div");
        userRatingDiv.className = "rating rating-user";
        userRatingDiv.setAttribute("aria-label", "Оценить рецепт");

        for (let i = 5; i >= 1; i--) {
          const star = document.createElement("span");
          star.textContent = "★";
          star.tabIndex = 0;
          star.setAttribute("role", "button");
          star.setAttribute(
            "aria-pressed",
            recipe.userRatings && recipe.userRatings[state.currentUser.username] === i ? "true" : "false"
          );
          if (recipe.userRatings && recipe.userRatings[state.currentUser.username] >= i) {
            star.classList.add("filled");
          }
          star.addEventListener("click", e => {
            e.stopPropagation();
            rateRecipe(recipe.id, i);
          });
          star.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              rateRecipe(recipe.id, i);
            }
          });
          userRatingDiv.appendChild(star);
        }
        infoDiv.appendChild(userRatingDiv);
      }

      if (state.currentUser && state.currentUser.isAdmin) {
        const actions = document.createElement("div");
        actions.className = "recipe-actions";

        const btnEdit = document.createElement("button");
        btnEdit.textContent = "Редактировать";
        btnEdit.addEventListener("click", e => {
          e.stopPropagation();
          openRecipeModal(recipe);
        });

        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Удалить";
        btnDelete.className = "delete-btn";
        btnDelete.addEventListener("click", e => {
          e.stopPropagation();
          if (confirm(`Удалить рецепт "${recipe.title}"?`)) {
            deleteRecipe(recipe.id);
          }
        });

        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);
        infoDiv.appendChild(actions);
      }

      card.appendChild(infoDiv);

      card.style.cursor = "pointer";
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

  function rateRecipe(recipeId, rating) {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    if (!recipe.userRatings) recipe.userRatings = {};
    recipe.userRatings[state.currentUser.username] = rating;

    recipe.ratings = Object.values(recipe.userRatings);

    filterAndRenderRecipes();
  }

function deleteRecipe(recipeId) {
  if (!confirm(`Удалить рецепт?`)) return;

  // Добавьте серверный вызов
  fetch('php/delete_recipe.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id: recipeId }),
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert(data.message);
      fetchApprovedRecipes(); // Перезагружаем рецепты
      filterAndRenderRecipes();
    } else {
      alert(data.error || 'Ошибка при удалении рецепта');
    }
  })
  .catch(error => {
    console.error('Ошибка удаления:', error);
    alert('Ошибка сети или сервера: ' + error.message);
  });
}

  function clearIngredientsInputs() {
    ingredientsContainer.innerHTML = "";
    addIngredientInput();
  }

  function addIngredientInput(value = "") {
    const div = document.createElement("div");
    div.className = "ingredient-row";

    const input = document.createElement("input");
    input.type = "text";
    input.name = "ingredients[]";
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
    textarea.name = "steps[]";    
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

    inputImageFile.value = "";

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

recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!state.currentUser) {
    alert("Для добавления рецепта необходимо войти в систему.");
    closeRecipeModal();
    openAuthModal("login");
    return;
  }

  const title = inputTitle.value.trim();
  const cookTime = Number(inputCookTime.value);
  const category = inputCategory.value;

  const ingredientInputs = ingredientsContainer.querySelectorAll("input");
  const ingredients = Array.from(ingredientInputs).map(i => i.value.trim().toLowerCase()).filter(Boolean);

  const stepTextareas = stepsContainer.querySelectorAll("textarea");
  const steps = Array.from(stepTextareas).map(t => t.value.trim()).filter(Boolean);

  if (!title) {
    alert("Пожалуйста, введите название рецепта");
    return;
  }
  if (!cookTime || isNaN(cookTime) || cookTime <= 0) {
    alert("Пожалуйста, введите корректное время приготовления (в минутах)");
    return;
  }
  if (!category) {
    alert("Пожалуйста, выберите категорию");
    return;
  }
  if (ingredients.length === 0) {
    alert("Пожалуйста, добавьте хотя бы один ингредиент");
    return;
  }
  if (steps.length === 0) {
    alert("Пожалуйста, добавьте хотя бы один шаг приготовления");
    return;
  }

  const isEditing = !!state.editingRecipeId;

  if (!inputImageFile.files || inputImageFile.files.length === 0) {
    if (!isEditing) {
      alert("Пожалуйста, загрузите фото рецепта");
      return;
    }
  }

  async function validateImageFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width < 600 || img.height < 400) {
          alert("Изображение слишком маленькое. Минимальный размер: 600x400 пикселей.");
          inputImageFile.value = "";
          imagePreview.style.display = "none";
          imagePreview.src = "";
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Image too small"));
          return;
        }
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.onerror = () => {
        alert("Не удалось загрузить изображение для проверки размера");
        inputImageFile.value = "";
        imagePreview.style.display = "none";
        imagePreview.src = "";
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image load error"));
      };
      img.src = objectUrl;
    });
  }

  if (isEditing) {
    if (!state.currentUser.isAdmin) {
      alert("Редактировать рецепт может только администратор");
      return;
    }

    let imageFile = null;
    if (inputImageFile.files && inputImageFile.files.length > 0) {
      try {
        imageFile = await validateImageFile(inputImageFile.files[0]);
      } catch (err) {
        return;
      }
    }

    const formData = new FormData();
    formData.append('id', state.editingRecipeId);
    formData.append('title', title);
    formData.append('cook_time', cookTime);
    formData.append('category', category);

    const rawIngredients = Array.from(ingredientInputs).map(i => i.value.trim()).filter(Boolean);
    rawIngredients.forEach(ing => formData.append('ingredients[]', ing));
    steps.forEach(step => formData.append('steps[]', step));

    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    try {
      const response = await fetch('php/update_recipe.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        alert(data.message || "Рецепт успешно обновлён");
        closeRecipeModal();
        await fetchApprovedRecipes(); // Перезагружаем рецепты с сервера
        filterAndRenderRecipes();
      } else {
        alert(data.error || 'Ошибка при обновлении рецепта');
      }
    } catch (error) {
      console.error('Ошибка обновления:', error);
      alert('Ошибка сети или сервера: ' + error.message);
    }

    return;
  }

  try {
    let imageFile = null;
    if (inputImageFile.files && inputImageFile.files.length > 0) {
      imageFile = await validateImageFile(inputImageFile.files[0]);
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('cook_time', cookTime);
    formData.append('category', category);
    formData.append('author', state.currentUser.username);
    formData.append('action', 'add_recipe');

    const rawIngredients = Array.from(ingredientInputs).map(i => i.value.trim()).filter(Boolean);
    rawIngredients.forEach(ing => formData.append('ingredients[]', ing));

    steps.forEach(step => formData.append('steps[]', step));

    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    const response = await fetch('php/upload_recipe.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      alert(data.message || "Рецепт отправлен на модерацию");
      closeRecipeModal();
      location.reload();
    } else {
      alert(data.error || 'Ошибка при отправке рецепта');
    }
  } catch (error) {
    console.error('Ошибка отправки:', error);
    alert('Ошибка сети или сервера. Попробуйте позже: ' + error.message);
  }
});

  inputImageFile.addEventListener("change", () => {
    const file = inputImageFile.files[0];
    if (!file) {
      imagePreview.style.display = "none";
      imagePreview.src = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите файл изображения");
      inputImageFile.value = "";
      imagePreview.style.display = "none";
      imagePreview.src = "";
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 600 || img.height < 400) {
        alert("Изображение слишком маленькое. Минимальный размер: 600x400 пикселей.");
        inputImageFile.value = "";
        imagePreview.style.display = "none";
        imagePreview.src = "";
        URL.revokeObjectURL(objectUrl);
        return;
      }
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = e => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      alert("Не удалось загрузить изображение для проверки размера");
      inputImageFile.value = "";
      imagePreview.style.display = "none";
      imagePreview.src = "";
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });

  btnAddIngredient.addEventListener("click", () => addIngredientInput());
  btnAddStep.addEventListener("click", () => addStepInput());

  btnCloseModal.addEventListener("click", closeRecipeModal);

  modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) closeRecipeModal();
  });

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
  
    if (loginEmailInput) {
      loginEmailInput.focus();
    }
  }  

  function showRegisterTab() {
    tabRegister.classList.add("active");
    tabRegister.setAttribute("aria-selected", "true");
    tabLogin.classList.remove("active");
    tabLogin.setAttribute("aria-selected", "false");
    registerForm.hidden = false;
    loginForm.hidden = true;
  
    if (registerUsername) {
      registerUsername.focus();
    }
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
  { id: "addRecipe", label: "Добавить рецепт/Модерация" },
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
    if (user && user.avatarDataUrl) {
      avatarBtn.style.backgroundImage = `url(${user.avatarDataUrl})`;
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
      if (state.currentUser && state.currentUser.isAdmin) {
        window.location.href = "moderation.php";
      } else {openRecipeModal();}}
      else if (id === "logout") {
        logoutUser();
      }
    });

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

  function updateAdminNav() {
    const btnAction = document.getElementById("userMenu_addRecipe");
    if (!btnAction) return;
    
    if (state.currentUser && state.currentUser.isAdmin) {
      btnAction.textContent = "Модерация";
    } else {
      btnAction.textContent = "Добавить рецепт";
    }
  }

  function updateUserUIAfterLogin(user) {
    if (!user) return;
    state.currentUser = user;
    updateUserNav();
    updateAdminNav();
    closeAuthModal();
    console.log(`Пользователь вошел: ${user.username}`);
  }

async function init() {
  state.currentUser = window._CURRENT_USER || null;

  await fetchCategories();
  await fetchIngredients();
  await fetchApprovedRecipes()

  updateUserNav();
  updateAdminNav();
  renderCategories();
  renderIngredientsFilter();
  filterAndRenderRecipes();
}

  init();
})();