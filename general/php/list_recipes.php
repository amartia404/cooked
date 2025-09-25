<?php
require 'config.php';

$stmt = $pdo->prepare('SELECT r.id, r.title, r.instructions, r.image_path, u.username AS author FROM recipes r JOIN users u ON r.user_id = u.id WHERE r.status = "approved" ORDER BY r.created_at DESC');
$stmt->execute();

$recipes = $stmt->fetchAll();

echo json_encode(['success' => true, 'recipes' => $recipes]);
