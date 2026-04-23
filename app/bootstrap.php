<?php

declare(strict_types=1);

$isSecureRequest = (
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
);

if (function_exists('ini_set')) {
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.sid_length', '48');
}

if (function_exists('header_remove')) {
    header_remove('X-Powered-By');
}

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
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()');
header('Cross-Origin-Opener-Policy: same-origin');
header('Cross-Origin-Resource-Policy: same-origin');

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

function request_method(): string
{
    return strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
}

function current_request_origin(): ?string
{
    $host = trim((string) ($_SERVER['HTTP_HOST'] ?? ''));
    if ($host === '') {
        return null;
    }

    $isSecureRequest = (
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
    );

    return ($isSecureRequest ? 'https://' : 'http://') . strtolower($host);
}

function normalized_origin(string $url): ?string
{
    $parts = parse_url(trim($url));
    if (!is_array($parts)) {
        return null;
    }

    $scheme = strtolower((string) ($parts['scheme'] ?? ''));
    $host = strtolower((string) ($parts['host'] ?? ''));
    if ($scheme === '' || $host === '') {
        return null;
    }

    $port = isset($parts['port']) ? (int) $parts['port'] : null;
    $isDefaultPort = (
        $port === null
        || ($scheme === 'https' && $port === 443)
        || ($scheme === 'http' && $port === 80)
    );

    return $scheme . '://' . $host . ($isDefaultPort ? '' : ':' . $port);
}

function require_same_origin_request(): void
{
    $currentOrigin = current_request_origin();
    if ($currentOrigin === null) {
        return;
    }

    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    $referer = trim((string) ($_SERVER['HTTP_REFERER'] ?? ''));

    if ($origin !== '') {
        if (normalized_origin($origin) !== normalized_origin($currentOrigin)) {
            json_response([
                'ok' => false,
                'message' => 'Origem da requisição não autorizada.',
            ], 403);
        }

        return;
    }

    if ($referer !== '' && normalized_origin($referer) !== normalized_origin($currentOrigin)) {
        json_response([
            'ok' => false,
            'message' => 'Origem da requisição não autorizada.',
        ], 403);
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
    require_same_origin_request();

    $sentToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $sessionToken = $_SESSION['csrf_token'] ?? '';

    if (!$sentToken || !$sessionToken || !hash_equals((string) $sessionToken, (string) $sentToken)) {
        json_response([
            'ok' => false,
            'message' => 'Sessão expirada. Atualize a página e tente novamente.',
        ], 419);
    }
}

function clean_text($value, int $maxLength): string
{
    $text = trim((string) $value);
    $text = preg_replace('/\s+/', ' ', $text) ?? '';

    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength);
    }

    return substr($text, 0, $maxLength);
}

function normalize_email($value): string
{
    return strtolower(trim((string) $value));
}

function password_is_strong(string $password): bool
{
    return (bool) preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $password);
}

function bool_from_input($value): bool
{
    return in_array($value, [true, 1, '1', 'true', 'on', 'yes'], true);
}

function request_content_length(): int
{
    return max(0, (int) ($_SERVER['CONTENT_LENGTH'] ?? 0));
}

function limit_request_body_size(int $maxBytes = 32768): void
{
    if (!in_array(request_method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
        return;
    }

    if (request_content_length() <= $maxBytes) {
        return;
    }

    json_response([
        'ok' => false,
        'message' => 'A solicitação excede o tamanho permitido.',
    ], 413);
}

function honeypot_triggered(array $data, string $fieldName = 'website'): bool
{
    return clean_text($data[$fieldName] ?? '', 120) !== '';
}

function rate_limit_storage_path(string $scope, string $identifier): string
{
    $directory = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'eat-rate-limits';

    if (!is_dir($directory)) {
        @mkdir($directory, 0700, true);
    }

    return $directory . DIRECTORY_SEPARATOR . hash('sha256', $scope . '|' . $identifier) . '.json';
}

function apply_rate_limit(
    string $scope,
    string $identifier,
    int $maxAttempts,
    int $windowSeconds,
    string $message = 'Muitas tentativas. Aguarde um pouco e tente novamente.'
): void {
    $normalizedIdentifier = clean_text($identifier, 200);
    if ($normalizedIdentifier === '') {
        $normalizedIdentifier = 'anon';
    }

    $storagePath = rate_limit_storage_path($scope, $normalizedIdentifier);
    $handle = @fopen($storagePath, 'c+');

    if ($handle === false) {
        return;
    }

    $now = time();

    try {
        if (!flock($handle, LOCK_EX)) {
            return;
        }

        rewind($handle);
        $payload = json_decode(stream_get_contents($handle) ?: '{}', true);
        $timestamps = array_values(array_filter(
            array_map('intval', (array) ($payload['timestamps'] ?? [])),
            static fn (int $timestamp): bool => $timestamp > ($now - $windowSeconds)
        ));

        if (count($timestamps) >= $maxAttempts) {
            $retryAfter = max(1, $windowSeconds - ($now - $timestamps[0]));
            header('Retry-After: ' . $retryAfter);

            json_response([
                'ok' => false,
                'message' => $message,
            ], 429);
        }

        $timestamps[] = $now;

        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode(['timestamps' => $timestamps], JSON_UNESCAPED_SLASHES));
        fflush($handle);
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function clear_rate_limit(string $scope, string $identifier): void
{
    $normalizedIdentifier = clean_text($identifier, 200);
    if ($normalizedIdentifier === '') {
        return;
    }

    $storagePath = rate_limit_storage_path($scope, $normalizedIdentifier);
    if (is_file($storagePath)) {
        @unlink($storagePath);
    }
}

function safe_database_error_message(Throwable $exception, string $fallback): string
{
    $safeMessages = [
        'Configuração do banco de dados incompleta.',
        'Senha do banco de dados não configurada.',
        'Extensão PDO do PHP indisponível.',
        'Extensão pdo_mysql do PHP indisponível.',
    ];

    $message = $exception->getMessage();

    if (in_array($message, $safeMessages, true)) {
        return $message;
    }

    return $fallback;
}

function client_ip(): ?string
{
    $candidates = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        explode(',', (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''))[0] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? '',
    ];

    foreach ($candidates as $candidate) {
        $ip = trim((string) $candidate);
        if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return null;
}

function client_user_agent(): ?string
{
    $userAgent = clean_text($_SERVER['HTTP_USER_AGENT'] ?? '', 255);
    return $userAgent !== '' ? $userAgent : null;
}

function session_user_payload(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'name' => (string) $user['name'],
        'email' => (string) $user['email'],
    ];
}

limit_request_body_size();
