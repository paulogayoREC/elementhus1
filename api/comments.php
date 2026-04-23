<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';
require dirname(__DIR__) . '/app/Database.php';
require dirname(__DIR__) . '/app/CommentStorage.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    try {
        $pdo = Database::connection();
        ensure_community_comments_table($pdo);

        $limit = (int) ($_GET['limit'] ?? 5);
        $limit = max(1, min(20, $limit));

        $statement = $pdo->prepare(
            'SELECT id, name, rating, message, created_at
             FROM community_comments
             WHERE status = :status
             ORDER BY created_at DESC, id DESC
             LIMIT ' . $limit
        );
        $statement->execute(['status' => 'published']);

        $comments = array_map('public_comment_payload', $statement->fetchAll());

        json_response([
            'ok' => true,
            'comments' => $comments,
        ]);
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        json_response([
            'ok' => false,
            'message' => safe_database_error_message(
                $exception,
                'Não foi possível carregar os comentários agora.'
            ),
        ], 500);
    }
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    json_response([
        'ok' => false,
        'message' => 'Método não permitido.',
    ], 405);
}

require_csrf();

$data = request_json();
$name = clean_text($data['name'] ?? '', 48);
$rating = (int) ($data['rating'] ?? 0);
$message = clean_text($data['message'] ?? '', 500);
$clientIp = client_ip() ?? 'unknown';
$errors = [];

if (honeypot_triggered($data)) {
    json_response([
        'ok' => false,
        'message' => 'Não foi possível publicar o comentário informado.',
    ], 422);
}

apply_rate_limit(
    'community-comment-ip',
    $clientIp,
    8,
    600,
    'Você enviou comentários demais em pouco tempo. Aguarde alguns instantes antes de tentar novamente.'
);

if ($name === '' || strlen($name) < 2) {
    $errors['name'] = 'Informe seu nome.';
}

if ($rating < 1 || $rating > 5) {
    $errors['rating'] = 'Escolha uma nota de 1 a 5 estrelas.';
}

if ($message === '' || strlen($message) < 3) {
    $errors['message'] = 'Escreva uma mensagem com pelo menos 3 caracteres.';
}

if ($errors) {
    json_response([
        'ok' => false,
        'message' => 'Revise os campos do comentário.',
        'errors' => $errors,
    ], 422);
}

try {
    $pdo = Database::connection();
    ensure_community_comments_table($pdo);

    $recent = $pdo->prepare(
        'SELECT COUNT(*) AS total
         FROM community_comments
         WHERE submitted_ip <=> :submitted_ip
           AND created_at >= :since'
    );
    $recent->execute([
        'submitted_ip' => $clientIp,
        'since' => gmdate('Y-m-d H:i:s', time() - 120),
    ]);
    $recentTotal = (int) (($recent->fetch()['total'] ?? 0));

    if ($recentTotal >= 3) {
        json_response([
            'ok' => false,
            'message' => 'Aguarde alguns instantes antes de publicar outro comentário.',
        ], 429);
    }

    $insert = $pdo->prepare(
        'INSERT INTO community_comments (
            user_id,
            name,
            rating,
            message,
            status,
            submitted_ip,
            submitted_user_agent
        ) VALUES (
            :user_id,
            :name,
            :rating,
            :message,
            :status,
            :submitted_ip,
            :submitted_user_agent
        )'
    );
    $insert->execute([
        'user_id' => isset($_SESSION['user']['id']) ? (int) $_SESSION['user']['id'] : null,
        'name' => $name,
        'rating' => $rating,
        'message' => $message,
        'status' => 'published',
        'submitted_ip' => $clientIp,
        'submitted_user_agent' => client_user_agent(),
    ]);

    $statement = $pdo->prepare(
        'SELECT id, name, rating, message, created_at
         FROM community_comments
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => (int) $pdo->lastInsertId()]);
    $comment = $statement->fetch();
    if (!$comment) {
        throw new RuntimeException('Comentário salvo, mas não foi possível reler o registro.');
    }

    json_response([
        'ok' => true,
        'message' => 'Comentário publicado com segurança.',
        'comment' => public_comment_payload($comment),
    ], 201);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    json_response([
        'ok' => false,
        'message' => safe_database_error_message(
            $exception,
            'Não foi possível publicar o comentário agora.'
        ),
    ], 500);
}
