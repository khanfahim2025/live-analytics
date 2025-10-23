<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get the JSON data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

// Log the data
error_log('📊 Received tracking data: ' . json_encode($data));

// Store the data in a simple file
$filename = 'tracking_data.json';
$existingData = [];

if (file_exists($filename)) {
    $existingData = json_decode(file_get_contents($filename), true) ?: [];
}

$existingData[] = [
    'timestamp' => date('Y-m-d H:i:s'),
    'data' => $data
];

// Keep only last 1000 entries
if (count($existingData) > 1000) {
    $existingData = array_slice($existingData, -1000);
}

file_put_contents($filename, json_encode($existingData));

// Return success
echo json_encode(['status' => 'success', 'message' => 'Data received']);
?>
