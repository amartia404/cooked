<?php
header('Content-Type: application/json');
require 'config.php';  // Подключение к БД

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? null;
$id = (int) ($data['id'] ?? 0);

if (!$action || !$id) {
    echo json_encode(['success' => false, 'error' => 'Неверные данные']);
    exit;
}

try {
    if ($action === 'approve') {
        // Одобрить: изменить статус
        $stmt = $pdo->prepare('UPDATE recipes SET status = "approved" WHERE id = ? AND status = "pending"');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Рецепт одобрен']);
    } elseif ($action === 'reject') {
        // Отклонить: удалить (status='pending' для защиты от удаления одобренных)
        $stmt = $pdo->prepare('DELETE FROM recipes WHERE id = ? AND status = "pending"');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Рецепт отклонен и удален']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Неизвестное действие']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка: ' . $e->getMessage()]);
}
?>
