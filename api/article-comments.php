<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';
require dirname(__DIR__) . '/app/Database.php';
require dirname(__DIR__) . '/app/ArticleCommentStorage.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $contentSlug = clean_text($_GET['content'] ?? '', 120);

    if ($contentSlug === '') {
        json_response([
            'ok' => false,
            'message' => 'Conteúdo não informado.',
        ], 422);
    }

    try {
        $pdo = Database::connection();
        ensure_article_comments_table($pdo);

        $limit = (int) ($_GET['limit'] ?? 5);
        $limit = max(1, min(20, $limit));

        $statement = $pdo->prepare(
            'SELECT id, content_slug, name, message, created_at
             FROM article_comments
             WHERE content_slug = :content_slug
               AND status = :status
             ORDER BY created_at DESC, id DESC
             LIMIT ' . $limit
        );
        $statement->execute([
            'content_slug' => $contentSlug,
            'status' => 'published',
        ]);

        $comments = array_map('public_article_comment_payload', $statement->fetchAll());

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
                'Não foi possível carregar os comentários deste conteúdo agora.'
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
$contentSlug = clean_text($data['contentSlug'] ?? '', 120);
$pageSlug = clean_text($data['pageSlug'] ?? '', 120);
$contentTitle = clean_text($data['contentTitle'] ?? '', 190);
$name = clean_text($data['name'] ?? '', 48);
$message = clean_text($data['message'] ?? '', 500);
$errors = [];

if ($contentSlug === '') {
    $errors['contentSlug'] = 'Conteúdo não informado.';
}

if ($pageSlug === '') {
    $errors['pageSlug'] = 'Página não informada.';
}

if ($contentTitle === '') {
    $errors['contentTitle'] = 'Título do conteúdo não informado.';
}

if ($name === '' || strlen($name) < 2) {
    $errors['name'] = 'Informe seu nome.';
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
    ensure_article_comments_table($pdo);

    $clientIp = client_ip();
    $recent = $pdo->prepare(
        'SELECT COUNT(*) AS total
         FROM article_comments
         WHERE submitted_ip <=> :submitted_ip
           AND content_slug = :content_slug
           AND created_at >= :since'
    );
    $recent->execute([
        'submitted_ip' => $clientIp,
        'content_slug' => $contentSlug,
        'since' => gmdate('Y-m-d H:i:s', time() - 120),
    ]);
    $recentTotal = (int) (($recent->fetch()['total'] ?? 0));

    if ($recentTotal >= 3) {
        json_response([
            'ok' => false,
            'message' => 'Aguarde alguns instantes antes de publicar outro comentário neste conteúdo.',
        ], 429);
    }

    $insert = $pdo->prepare(
        'INSERT INTO article_comments (
            content_slug,
            page_slug,
            content_title,
            user_id,
            name,
            message,
            status,
            submitted_ip,
            submitted_user_agent
        ) VALUES (
            :content_slug,
            :page_slug,
            :content_title,
            :user_id,
            :name,
            :message,
            :status,
            :submitted_ip,
            :submitted_user_agent
        )'
    );
    $insert->execute([
        'content_slug' => $contentSlug,
        'page_slug' => $pageSlug,
        'content_title' => $contentTitle,
        'user_id' => isset($_SESSION['user']['id']) ? (int) $_SESSION['user']['id'] : null,
        'name' => $name,
        'message' => $message,
        'status' => 'published',
        'submitted_ip' => $clientIp,
        'submitted_user_agent' => client_user_agent(),
    ]);

    $statement = $pdo->prepare(
        'SELECT id, content_slug, name, message, created_at
         FROM article_comments
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
        'message' => 'Comentário publicado neste conteúdo.',
        'comment' => public_article_comment_payload($comment),
    ], 201);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    json_response([
        'ok' => false,
        'message' => safe_database_error_message(
            $exception,
            'Não foi possível publicar o comentário neste conteúdo agora.'
        ),
    ], 500);
}
