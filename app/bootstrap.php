<?php

declare(strict_types=1);

$isSecureRequest = (
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name('eat_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isSecureRequest,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function json_response(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function request_json(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (strpos($contentType, 'application/json') !== false) {
        $rawBody = file_get_contents('php://input');
        $decoded = json_decode($rawBody ?: '{}', true);

        if (!is_array($decoded)) {
            json_response([
                'ok' => false,
                'message' => 'Não foi possível ler os dados enviados.',
            ], 400);
        }

        return $decoded;
    }

    return $_POST;
}

function require_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        json_response([
            'ok' => false,
            'message' => 'Método não permitido.',
        ], 405);
    }
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return (string) $_SESSION['csrf_token'];
}

function require_csrf(): void
{
    $sentToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $sessionToken = $_SESSION['csrf_token'] ?? '';

    if (!$sentToken || !$sessionToken || !hash_equals((string) $sessionToken, (string) $sentToken)) {
        json_response([
            'ok' => false,
            'message' => 'Sessão expirada. Atualize a página e tente novamente.',
        ], 419);
    }
}

function clean_text(mixed $value, int $maxLength): string
{
    $text = trim((string) $value);
    $text = preg_replace('/\s+/', ' ', $text) ?? '';

    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength);
    }

    return substr($text, 0, $maxLength);
}

function normalize_email(mixed $value): string
{
    return strtolower(trim((string) $value));
}

function password_is_strong(string $password): bool
{
    return (bool) preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $password);
}

function bool_from_input(mixed $value): bool
{
    return in_array($value, [true, 1, '1', 'true', 'on', 'yes'], true);
}

function session_user_payload(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'name' => (string) $user['name'],
        'email' => (string) $user['email'],
    ];
}
