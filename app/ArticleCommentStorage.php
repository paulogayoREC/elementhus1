<?php

declare(strict_types=1);

function article_comments_table_sql(): string
{
    return "CREATE TABLE IF NOT EXISTS article_comments (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        content_slug VARCHAR(120) NOT NULL,
        page_slug VARCHAR(120) NOT NULL,
        content_title VARCHAR(190) NOT NULL,
        user_id BIGINT UNSIGNED NULL,
        name VARCHAR(48) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(24) NOT NULL DEFAULT 'published',
        submitted_ip VARCHAR(45) NULL,
        submitted_user_agent VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY article_comments_content_status_created_index (content_slug, status, created_at),
        KEY article_comments_page_created_index (page_slug, created_at),
        KEY article_comments_user_created_index (user_id, created_at),
        CONSTRAINT article_comments_user_id_foreign
            FOREIGN KEY (user_id) REFERENCES users (id)
            ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
}

function ensure_article_comments_table(PDO $pdo): void
{
    try {
        $pdo->query(
            'SELECT id, content_slug, page_slug, content_title, user_id, name, message, status, submitted_ip, submitted_user_agent, created_at, updated_at
             FROM article_comments
             WHERE 1 = 0'
        );
        return;
    } catch (PDOException $exception) {
        $message = $exception->getMessage();
        $tableIsMissing = (
            $exception->getCode() === '42S02'
            || strpos($message, '1146') !== false
            || stripos($message, 'Base table or view not found') !== false
        );

        if (!$tableIsMissing) {
            throw $exception;
        }
    }

    $pdo->exec(article_comments_table_sql());
}

function public_article_comment_payload(array $comment): array
{
    return [
        'id' => (int) $comment['id'],
        'contentSlug' => (string) $comment['content_slug'],
        'name' => (string) $comment['name'],
        'message' => (string) $comment['message'],
        'createdAt' => (string) $comment['created_at'],
    ];
}
