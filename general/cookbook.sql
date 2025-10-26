-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Окт 26 2025 г., 03:40
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `cookbook`
--

-- --------------------------------------------------------

--
-- Структура таблицы `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `key_name` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `categories`
--

INSERT INTO `categories` (`id`, `key_name`, `label`, `created_at`) VALUES
(1, '', 'Все', '2025-09-29 23:49:41'),
(2, 'мясо', 'Мясо', '2025-09-29 23:49:41'),
(3, 'рыба', 'Рыба', '2025-09-29 23:49:41'),
(4, 'веганское', 'Веганское', '2025-09-29 23:49:41'),
(5, 'десерты', 'Десерты', '2025-09-29 23:49:41');

-- --------------------------------------------------------

--
-- Структура таблицы `ingredients`
--

CREATE TABLE `ingredients` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `ingredients`
--

INSERT INTO `ingredients` (`id`, `name`) VALUES
(8, 'говядина'),
(22, 'зелень'),
(25, 'Капуста'),
(1, 'картофель'),
(24, 'Картошка'),
(7, 'курица'),
(23, 'лавровый лист'),
(3, 'лук'),
(17, 'макароны'),
(11, 'масло'),
(19, 'молоко'),
(2, 'морковь'),
(15, 'мука'),
(6, 'огурцы'),
(13, 'перец'),
(5, 'помидоры'),
(16, 'рис'),
(10, 'рыба'),
(14, 'сахар'),
(26, 'Свекла'),
(9, 'свинина'),
(20, 'сливки'),
(21, 'сметана'),
(12, 'соль'),
(4, 'чеснок'),
(18, 'яйца');

-- --------------------------------------------------------

--
-- Структура таблицы `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `recipes`
--

CREATE TABLE `recipes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `cook_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Время готовки в минутах',
  `category` varchar(255) NOT NULL,
  `ingredients` text DEFAULT NULL,
  `steps` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `recipes`
--

INSERT INTO `recipes` (`id`, `user_id`, `title`, `cook_time`, `category`, `ingredients`, `steps`, `image_path`, `status`, `created_at`, `updated_at`) VALUES
(9, 2, 'Борщ', 45, 'мясо', '[\"Картофель\",\"Лук\",\"Свекла\",\"Морковь\"]', '[\"Прочитать рецепт\"]', 'php/uploads/recipe_68fd6b2c6fc03_clnBPzI-49GJ76tBQGEzvW-H-9Up6ckiGyrLNfVfimqf4w-CgI2YMqUaCNEDu1ezoQKJwhgwAZ87hgf0Z3NQgpY4U-30zCGzT_0Zw9Kzg6mfh-rAXXi5NTiA.webp', 'approved', '2025-10-26 00:28:28', '2025-10-26 00:29:27');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `is_admin`, `created_at`, `avatar`) VALUES
(2, 'amartia', 'sn4k@bk.ru', '$2y$10$PltMhM2.UQ5qB14KlkF19e6Nk0Rv8G8FjW1fjCiPCv9LgPFjh2AAK', 0, '2025-09-17 08:01:19', 'img/avatars/amartia_2.jpg'),
(4, 'admin', 'admin@bk.ru', '$2y$10$gJjdNhUWhJabIb0nB7VpbOJFkyETywYAFkfLk5Cs.2hOKftf4DIj2', 1, '2025-10-05 11:19:56', 'img/avatars/admin_4.jpg');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key_name` (`key_name`);

--
-- Индексы таблицы `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Индексы таблицы `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Индексы таблицы `recipes`
--
ALTER TABLE `recipes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `ingredients`
--
ALTER TABLE `ingredients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT для таблицы `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `recipes`
--
ALTER TABLE `recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`);

--
-- Ограничения внешнего ключа таблицы `recipes`
--
ALTER TABLE `recipes`
  ADD CONSTRAINT `fk_recipes_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
