<?php

declare(strict_types=1);

function password_resets_table_sql(): string
{
    return 'CREATE TABLE IF NOT EXISTS password_resets (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        email VARCHAR(190) NOT NULL,
        token_hash CHAR(64) NOT NULL,
        requested_ip VARCHAR(45) NULL,
        requested_user_agent VARCHAR(255) NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY password_resets_token_hash_unique (token_hash),
        KEY password_resets_user_created_index (user_id, created_at),
        KEY password_resets_expires_at_index (expires_at),
        CONSTRAINT password_resets_user_id_foreign
            FOREIGN KEY (user_id) REFERENCES users (id)
            ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
}

function ensure_password_resets_table(PDO $pdo): void
{
    try {
        $pdo->query(
            'SELECT id, user_id, email, token_hash, requested_ip, requested_user_agent, expires_at, used_at, created_at
             FROM password_resets
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

    $pdo->exec(password_resets_table_sql());
}
