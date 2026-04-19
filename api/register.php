<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';
require dirname(__DIR__) . '/app/Database.php';

require_post();
require_csrf();

$legal = require dirname(__DIR__) . '/config/legal.php';
$data = request_json();

$name = clean_text($data['name'] ?? '', 120);
$email = normalize_email($data['email'] ?? '');
$password = (string) ($data['password'] ?? '');
$passwordConfirmation = (string) ($data['password_confirmation'] ?? '');
$termsAccepted = bool_from_input($data['terms_accepted'] ?? false);

$errors = [];

if ($name === '') {
    $errors['name'] = 'Informe seu nome completo.';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Informe um e-mail válido.';
}

if (!password_is_strong($password)) {
    $errors['password'] = 'Use no mínimo 8 caracteres, com maiúscula, minúscula e número.';
}

if ($password !== $passwordConfirmation) {
    $errors['password_confirmation'] = 'A confirmação precisa ser igual à senha.';
}

if (!$termsAccepted) {
    $errors['terms_accepted'] = 'Leia e aceite os Termos de Uso e a Política de Privacidade para continuar.';
}

if ($errors) {
    json_response([
        'ok' => false,
        'message' => 'Revise os campos destacados.',
        'errors' => $errors,
    ], 422);
}

try {
    $pdo = Database::connection();

    $exists = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $exists->execute(['email' => $email]);

    if ($exists->fetch()) {
        json_response([
            'ok' => false,
            'message' => 'Este e-mail já está cadastrado. Entre com sua senha ou use outro e-mail.',
            'errors' => [
                'email' => 'E-mail já cadastrado.',
            ],
        ], 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $insert = $pdo->prepare(
        'INSERT INTO users (
            name,
            email,
            password_hash,
            terms_accepted,
            terms_accepted_at,
            terms_version,
            privacy_version,
            terms_accepted_ip,
            terms_accepted_user_agent
        ) VALUES (
            :name,
            :email,
            :password_hash,
            :terms_accepted,
            :terms_accepted_at,
            :terms_version,
            :privacy_version,
            :terms_accepted_ip,
            :terms_accepted_user_agent
        )'
    );

    $insert->execute([
        'name' => $name,
        'email' => $email,
        'password_hash' => $passwordHash,
        'terms_accepted' => $termsAccepted ? 1 : 0,
        'terms_accepted_at' => gmdate('Y-m-d H:i:s'),
        'terms_version' => (string) $legal['terms_version'],
        'privacy_version' => (string) $legal['privacy_version'],
        'terms_accepted_ip' => client_ip(),
        'terms_accepted_user_agent' => client_user_agent(),
    ]);

    $user = [
        'id' => (int) $pdo->lastInsertId(),
        'name' => $name,
        'email' => $email,
    ];

    session_regenerate_id(true);
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['user'] = session_user_payload($user);

    json_response([
        'ok' => true,
        'message' => 'Cadastro concluído. Você já está conectado.',
        'csrfToken' => csrf_token(),
        'user' => $_SESSION['user'],
    ], 201);
} catch (PDOException $exception) {
    if ($exception->getCode() === '23000') {
        json_response([
            'ok' => false,
            'message' => 'Este e-mail já está cadastrado.',
            'errors' => [
                'email' => 'E-mail já cadastrado.',
            ],
        ], 409);
    }

    error_log($exception->getMessage());
    json_response([
        'ok' => false,
        'message' => 'Não foi possível criar o cadastro agora. Tente novamente em instantes.',
    ], 500);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    json_response([
        'ok' => false,
        'message' => 'Configuração indisponível. Verifique os dados do banco de dados.',
    ], 500);
}
