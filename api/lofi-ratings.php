<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';
require dirname(__DIR__) . '/app/Database.php';
require dirname(__DIR__) . '/app/LofiRatingStorage.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';
$allowedVideoIds = [
    'XsFkW-qZ8ZI',
    '218ELDhIiGY',
    'hb1fepHU_Jg',
    'd3HNN_DEjKI',
    '7gtIh5dF9Xk',
    'q_BCyHd0vhA',
    '7TX_d6HA74M',
    '9VcdqwYfwBo',
    'GSep96CLsgo',
    'xDih5SwFs_c',
];

if ($method === 'GET') {
    try {
        $pdo = Database::connection();
        ensure_lofi_video_ratings_table($pdo);

        json_response([
            'ok' => true,
            'ratings' => lofi_video_rating_summaries($pdo, lofi_rating_session_key()),
        ]);
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        json_response([
            'ok' => false,
            'message' => safe_database_error_message(
                $exception,
                'Nao foi possivel carregar as avaliacoes agora.'
            ),
        ], 500);
    }
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    json_response([
        'ok' => false,
        'message' => 'Metodo nao permitido.',
    ], 405);
}

require_csrf();

$data = request_json();
$videoId = clean_text($data['videoId'] ?? '', 32);
$rating = (int) ($data['rating'] ?? 0);
$errors = [];

apply_rate_limit(
    'lofi-rating-session',
    lofi_rating_session_key(),
    80,
    600,
    'Voce avaliou muitos videos em pouco tempo. Aguarde alguns instantes antes de tentar novamente.'
);

if (!in_array($videoId, $allowedVideoIds, true)) {
    $errors['videoId'] = 'Video invalido.';
}

if ($rating < 1 || $rating > 5) {
    $errors['rating'] = 'Escolha uma nota de 1 a 5 estrelas.';
}

if ($errors) {
    json_response([
        'ok' => false,
        'message' => 'Revise a avaliacao informada.',
        'errors' => $errors,
    ], 422);
}

try {
    $pdo = Database::connection();
    ensure_lofi_video_ratings_table($pdo);

    $sessionKey = lofi_rating_session_key();
    $statement = $pdo->prepare(
        'INSERT INTO lofi_video_ratings (
            video_id,
            session_key,
            rating
        ) VALUES (
            :video_id,
            :session_key,
            :rating
        )
        ON DUPLICATE KEY UPDATE
            rating = VALUES(rating),
            updated_at = CURRENT_TIMESTAMP'
    );
    $statement->execute([
        'video_id' => $videoId,
        'session_key' => $sessionKey,
        'rating' => $rating,
    ]);

    json_response([
        'ok' => true,
        'message' => 'Avaliacao salva.',
        'rating' => lofi_video_rating_summary($pdo, $videoId, $sessionKey),
    ], 201);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    json_response([
        'ok' => false,
        'message' => safe_database_error_message(
            $exception,
            'Nao foi possivel salvar a avaliacao agora.'
        ),
    ], 500);
}
