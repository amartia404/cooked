<?php
// getIngredients.php
header('Content-Type: application/json; charset=utf-8');
session_start();  // если используется сессия для авторизации

$host = 'localhost';
$db   = 'cookbook';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=$charset", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Функция проверки, что пользователь админ
    function isAdmin() {
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
}

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // Получаем и возвращаем список ингредиентов
        $stmt = $pdo->query("SELECT name FROM ingredients ORDER BY name ASC");
        $ingredients = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode(['success' => true, 'ingredients' => $ingredients]);
        exit;
    }
    
    if ($method === 'POST') {
        // Добавление или удаление ингредиента
        if (!isAdmin()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Доступ запрещён']);
            exit;
        }
        
        // Получаем данные
        $input = $_POST;
        // Альтернативно: parse_str(file_get_contents('php://input'), $input); // если raw
        
        if (!isset($input['action']) || !isset($input['name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Необходимы параметры action и name']);
            exit;
        }
        
        $action = $input['action'];
        $name = mb_strtolower(trim($input['name']));
        if ($name === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Имя ингредиента не может быть пустым']);
            exit;
        }

        if ($action === 'add') {
            // Проверим, что ингредиент ещё не существует
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM ingredients WHERE name = :name");
            $stmt->execute([':name' => $name]);
            if ($stmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'error' => 'Ингредиент уже существует']);
                exit;
            }
            $stmt = $pdo->prepare("INSERT INTO ingredients (name) VALUES (:name)");
            $stmt->execute([':name' => $name]);
            echo json_encode(['success' => true, 'message' => 'Ингредиент добавлен']);
            exit;

        } elseif ($action === 'delete') {
            // Удаляем ингредиент
            $stmt = $pdo->prepare("DELETE FROM ingredients WHERE name = :name");
            $stmt->execute([':name' => $name]);
            echo json_encode(['success' => true, 'message' => 'Ингредиент удалён']);
            exit;

        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Неизвестное действие']);
            exit;
        }
    }

    // Если другие методы или нет подходящего запроса - ошибка
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Метод не поддерживается']);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
