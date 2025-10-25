// profile.js - адаптированный для user.php
"use strict";
(() => {
    const avatarBtn = document.querySelector('.user-avatar-btn');
    const userMenu = document.querySelector('.user-menu');
    const userNav = document.querySelector('#userNav');
    const authModal = document.querySelector('#authModal');
    const btnCloseAuthModal = document.querySelector('#btnCloseAuthModal');
    const tabLogin = document.querySelector('#tabLogin');
    const tabRegister = document.querySelector('#tabRegister');
    const loginForm = document.querySelector('#loginForm');
    const registerForm = document.querySelector('#registerForm');

    // Модальное окно для просмотра рецепта
    const recipeViewModal = document.querySelector('#recipeViewModal');
    const btnCloseRecipeView = document.querySelector('#btnCloseRecipeView');
    const recipeViewTitle = document.querySelector('#recipeViewTitle');
    const recipeViewImage = document.querySelector('#recipeViewImage');
    const recipeViewCookTime = document.querySelector('#recipeViewCookTime');
    const recipeViewCategory = document.querySelector('#recipeViewCategory');
    const recipeViewAuthor = document.querySelector('#recipeViewAuthor');
    const recipeViewIngredients = document.querySelector('#recipeViewIngredients');
    const recipeViewSteps = document.querySelector('#recipeViewSteps');
    const recipeViewRating = document.querySelector('#recipeViewRating');

    let state = {
        currentUser: null,
        categories: [],
        ingredients: []
    };

    // Асинхронная функция для получения рецепта по ID
    async function fetchRecipeById(id) {
        try {
            const response = await fetch(`php/getRecipeById.php?id=${id}`);
            const data = await response.json();
            if (data.success) {
                return data.recipe;
            } else {
                console.error("Ошибка загрузки рецепта:", data.error);
                return null;
            }
        } catch (err) {
            console.error("Не удалось загрузить рецепт", err);
            return null;
        }
    }

    // Функция для открытия модального окна просмотра рецепта
    async function openRecipeViewModal(recipeId) {
        const recipe = await fetchRecipeById(recipeId);
        if (!recipe) {
            alert("Не удалось загрузить рецепт.");
            return;
        }

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

        if (recipeViewAuthor) {
            recipeViewAuthor.textContent = recipe.author || "Неизвестный Автор";
            recipeViewAuthor.href = recipe.author_id ? `user.php?id=${recipe.author_id}` : '#';
            recipeViewAuthor.title = `Профиль ${recipe.author || 'автора'}`;
        }

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

    function averageRating(ratings) {
        if (!ratings || ratings.length === 0) return 0;
        return ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }

    // Функции для модального окна авторизации и меню пользователя из index.php
    // (Приведенные функции из index.php для авторизации, меню и т.д.)

    // ... (Вставьте соответствующие функции из script.js index.php для авторизации и меню пользователя)

    // Функция инициализации
    async function init() {
        state.currentUser = window._CURRENT_USER || null;

        // Загрузка категорий и ингредиентов, как в index.php
        await fetchCategories();
        await fetchIngredients();
        renderCategories();
        renderIngredientsFilter();

        updateUserNav();
        updateAdminNav();
    }

    // Нужен php/getRecipeById.php - создайте файл для получения рецепта по ID.
    // Пример:
    // <?php
    // include 'db_config.php';
    // $id = $_GET['id'];
    // $stmt = $pdo->prepare("SELECT * FROM recipes WHERE id = ?");
    // $stmt->execute([$id]);
    // $recipe = $stmt->fetch(PDO::FETCH_ASSOC);
    // echo json_encode(['success' => true, 'recipe' => $recipe]);
    // ?>

    init();
})();
