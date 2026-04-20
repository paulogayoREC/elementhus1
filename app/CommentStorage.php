<?php

declare(strict_types=1);

function community_comments_table_sql(): string
{
    return "CREATE TABLE IF NOT EXISTS community_comments (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NULL,
        name VARCHAR(48) NOT NULL,
        rating TINYINT UNSIGNED NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(24) NOT NULL DEFAULT 'published',
        submitted_ip VARCHAR(45) NULL,
        submitted_user_agent VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY community_comments_status_created_index (status, created_at),
        KEY community_comments_user_created_index (user_id, created_at),
        CONSTRAINT community_comments_user_id_foreign
            FOREIGN KEY (user_id) REFERENCES users (id)
            ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
}

function ensure_community_comments_table(PDO $pdo): void
{
    try {
        $pdo->query(
            'SELECT id, user_id, name, rating, message, status, submitted_ip, submitted_user_agent, created_at, updated_at
             FROM community_comments
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

    $pdo->exec(community_comments_table_sql());
}

function public_comment_payload(array $comment): array
{
    return [
        'id' => (int) $comment['id'],
        'name' => (string) $comment['name'],
        'rating' => (int) $comment['rating'],
        'message' => (string) $comment['message'],
        'createdAt' => (string) $comment['created_at'],
    ];
}
