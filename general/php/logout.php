<?php
session_start();  // <-- добавлена точка с запятой
require 'config.php';

session_destroy();

header('Content-Type: application/json'); // желательно сразу задать заголовок

echo json_encode(['success' => true, 'message' => 'Logged out']);
