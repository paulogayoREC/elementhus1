<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';
require dirname(__DIR__) . '/app/Database.php';
require dirname(__DIR__) . '/app/Mailer.php';
require dirname(__DIR__) . '/app/PasswordResetStorage.php';

require_post();
require_csrf();

$data = request_json();
$token = trim((string) ($data['token'] ?? ''));
$password = (string) ($data['password'] ?? '');
$passwordConfirmation = (string) ($data['password_confirmation'] ?? '');
$clientIp = client_ip() ?? 'unknown';

$errors = [];

if (honeypot_triggered($data)) {
    json_response([
        'ok' => false,
        'message' => 'Não foi possível processar a redefinição enviada.',
    ], 422);
}

apply_rate_limit(
    'password-reset-submit-ip',
    $clientIp,
    8,
    1800,
    'Muitas tentativas de redefinição. Aguarde alguns minutos antes de tentar novamente.'
);

if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
    $errors['token'] = 'Link de redefinição inválido ou expirado.';
}

if (!password_is_strong($password)) {
    $errors['password'] = 'Use no mínimo 8 caracteres, com maiúscula, minúscula e número.';
}

if ($password !== $passwordConfirmation) {
    $errors['password_confirmation'] = 'A confirmação precisa ser igual à nova senha.';
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
    ensure_password_resets_table($pdo);

    $tokenHash = hash('sha256', $token);
    $now = gmdate('Y-m-d H:i:s');

    $statement = $pdo->prepare(
        'SELECT
            password_resets.id AS reset_id,
            password_resets.user_id,
            password_resets.expires_at,
            users.name,
            users.email
         FROM password_resets
         INNER JOIN users ON users.id = password_resets.user_id
         WHERE password_resets.token_hash = :token_hash
           AND password_resets.used_at IS NULL
           AND password_resets.expires_at >= :now
         LIMIT 1'
    );
    $statement->execute([
        'token_hash' => $tokenHash,
        'now' => $now,
    ]);
    $reset = $statement->fetch();

    if (!$reset) {
        json_response([
            'ok' => false,
            'message' => 'Este link de redefinição é inválido, expirou ou já foi usado.',
            'errors' => [
                'token' => 'Solicite um novo link de redefinição.',
            ],
        ], 410);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $pdo->beginTransaction();

    $updateUser = $pdo->prepare(
        'UPDATE users
         SET password_hash = :password_hash,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :user_id'
    );
    $updateUser->execute([
        'password_hash' => $passwordHash,
        'user_id' => (int) $reset['user_id'],
    ]);

    $markUsed = $pdo->prepare(
        'UPDATE password_resets
         SET used_at = :used_at
         WHERE user_id = :user_id
           AND used_at IS NULL'
    );
    $markUsed->execute([
        'user_id' => (int) $reset['user_id'],
        'used_at' => $now,
    ]);

    $pdo->commit();

    if (isset($_SESSION['user']['id']) && (int) $_SESSION['user']['id'] === (int) $reset['user_id']) {
        unset($_SESSION['user']);
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    $emailContent = password_changed_email($reset);
    if (!send_html_mail((string) $reset['email'], $emailContent['subject'], $emailContent['html'], $emailContent['text'])) {
        error_log('Falha ao enviar confirmação de alteração de senha para user_id=' . (int) $reset['user_id']);
    }

    json_response([
        'ok' => true,
        'message' => 'Senha alterada com segurança. Entre novamente usando sua nova senha.',
        'csrfToken' => csrf_token(),
    ]);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log($exception->getMessage());
    json_response([
        'ok' => false,
        'message' => safe_database_error_message(
            $exception,
            'Não foi possível redefinir sua senha agora. Tente novamente em instantes.'
        ),
    ], 500);
}
