<?php
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$title = $_POST['title'] ?? '';
$instructions = $_POST['instructions'] ?? '';

if (trim($title) === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Title is required']);
    exit;
}

// Обработка загрузки изображения
$imagePath = null;

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $fileType = mime_content_type($_FILES['image']['tmp_name']);

    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Unsupported image type']);
        exit;
    }

    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $newFileName = uniqid('img_', true) . '.' . $ext;
    $uploadDir = __DIR__ . '/uploads/';

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $destination = $uploadDir . $newFileName;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $destination)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save uploaded file']);
        exit;
    }

    $imagePath = 'uploads/' . $newFileName;
}

// Сохраняем рецепт со статусом "pending"
$stmt = $pdo->prepare('INSERT INTO recipes (user_id, title, instructions, image_path, status) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$_SESSION['user_id'], $title, $instructions, $imagePath, 'pending']);

echo json_encode(['success' => true, 'message' => 'Recipe submitted and pending approval']);
