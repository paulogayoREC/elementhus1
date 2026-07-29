<?php

declare(strict_types=1);

function lofi_video_ratings_table_sql(): string
{
    return "CREATE TABLE IF NOT EXISTS lofi_video_ratings (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        video_id VARCHAR(32) NOT NULL,
        session_key CHAR(64) NOT NULL,
        rating TINYINT UNSIGNED NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY lofi_video_ratings_video_session_unique (video_id, session_key),
        KEY lofi_video_ratings_video_index (video_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
}

function ensure_lofi_video_ratings_table(PDO $pdo): void
{
    try {
        $pdo->query(
            'SELECT id, video_id, session_key, rating, created_at, updated_at
             FROM lofi_video_ratings
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

    $pdo->exec(lofi_video_ratings_table_sql());
}

function lofi_rating_session_key(): string
{
    $sessionId = session_id();
    if ($sessionId === '') {
        $sessionId = bin2hex(random_bytes(16));
    }

    return hash('sha256', 'lofi-video-rating|' . $sessionId);
}

function lofi_video_rating_payload(float $average, int $count, ?int $userRating = null): array
{
    return [
        'average' => round($average, 1),
        'count' => $count,
        'userRating' => $userRating,
    ];
}

function lofi_video_rating_summaries(PDO $pdo, ?string $sessionKey = null): array
{
    $statement = $pdo->query(
        'SELECT video_id, COUNT(*) AS rating_count, AVG(rating) AS average_rating
         FROM lofi_video_ratings
         GROUP BY video_id'
    );

    $summaries = [];
    foreach ($statement->fetchAll() as $row) {
        $summaries[(string) $row['video_id']] = lofi_video_rating_payload(
            (float) $row['average_rating'],
            (int) $row['rating_count']
        );
    }

    if ($sessionKey !== null) {
        $userStatement = $pdo->prepare(
            'SELECT video_id, rating
             FROM lofi_video_ratings
             WHERE session_key = :session_key'
        );
        $userStatement->execute(['session_key' => $sessionKey]);

        foreach ($userStatement->fetchAll() as $row) {
            $videoId = (string) $row['video_id'];
            if (!isset($summaries[$videoId])) {
                $summaries[$videoId] = lofi_video_rating_payload(0.0, 0);
            }

            $summaries[$videoId]['userRating'] = (int) $row['rating'];
        }
    }

    return $summaries;
}

function lofi_video_rating_summary(PDO $pdo, string $videoId, ?string $sessionKey = null): array
{
    $statement = $pdo->prepare(
        'SELECT COUNT(*) AS rating_count, AVG(rating) AS average_rating
         FROM lofi_video_ratings
         WHERE video_id = :video_id'
    );
    $statement->execute(['video_id' => $videoId]);
    $row = $statement->fetch() ?: [];

    $userRating = null;
    if ($sessionKey !== null) {
        $userStatement = $pdo->prepare(
            'SELECT rating
             FROM lofi_video_ratings
             WHERE video_id = :video_id
               AND session_key = :session_key
             LIMIT 1'
        );
        $userStatement->execute([
            'video_id' => $videoId,
            'session_key' => $sessionKey,
        ]);
        $userRow = $userStatement->fetch();
        if ($userRow) {
            $userRating = (int) $userRow['rating'];
        }
    }

    return lofi_video_rating_payload(
        (float) ($row['average_rating'] ?? 0),
        (int) ($row['rating_count'] ?? 0),
        $userRating
    );
}
