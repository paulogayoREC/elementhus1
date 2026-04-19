<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';
require dirname(__DIR__) . '/app/Database.php';

require_post();
require_csrf();

$data = request_json();
$email = normalize_email($data['email'] ?? '');
$password = (string) ($data['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    json_response([
        'ok' => false,
        'message' => 'Informe e-mail e senha para entrar.',
    ], 422);
}

try {
    $pdo = Database::connection();
    $statement = $pdo->prepare('SELECT id, name, email, password_hash FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => $email]);
    $user = $statement->fetch();

    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        json_response([
            'ok' => false,
            'message' => 'E-mail ou senha inválidos.',
        ], 401);
    }

    session_regenerate_id(true);
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['user'] = session_user_payload($user);

    json_response([
        'ok' => true,
        'message' => 'Login realizado com sucesso.',
        'csrfToken' => csrf_token(),
        'user' => $_SESSION['user'],
    ]);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    json_response([
        'ok' => false,
        'message' => safe_database_error_message(
            $exception,
            'Não foi possível entrar agora. Verifique a configuração do banco.'
        ),
    ], 500);
}
