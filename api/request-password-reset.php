<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';
require dirname(__DIR__) . '/app/Database.php';
require dirname(__DIR__) . '/app/Mailer.php';

require_post();
require_csrf();

$data = request_json();
$email = normalize_email($data['email'] ?? '');
$requestStartedAt = microtime(true);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response([
        'ok' => false,
        'message' => 'Informe um e-mail válido para receber as instruções.',
        'errors' => [
            'reset_email' => 'Informe um e-mail válido.',
        ],
    ], 422);
}

$genericMessage = 'Se este e-mail estiver cadastrado, enviaremos um link seguro para redefinir sua senha.';
$expiresMinutes = 30;

try {
    $pdo = Database::connection();
    $statement = $pdo->prepare('SELECT id, name, email FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => $email]);
    $user = $statement->fetch();

    if ($user) {
        $cooldown = $pdo->prepare(
            'SELECT id FROM password_resets
             WHERE user_id = :user_id
               AND created_at >= :cooldown_since
             ORDER BY id DESC
             LIMIT 1'
        );
        $cooldown->execute([
            'user_id' => (int) $user['id'],
            'cooldown_since' => gmdate('Y-m-d H:i:s', time() - 120),
        ]);

        if (!$cooldown->fetch()) {
            $token = bin2hex(random_bytes(32));
            $tokenHash = hash('sha256', $token);
            $expiresAt = gmdate('Y-m-d H:i:s', time() + ($expiresMinutes * 60));

            $pdo->beginTransaction();

            $invalidate = $pdo->prepare(
                'UPDATE password_resets
                 SET used_at = :used_at
                 WHERE user_id = :user_id
                   AND used_at IS NULL'
            );
            $invalidate->execute([
                'user_id' => (int) $user['id'],
                'used_at' => gmdate('Y-m-d H:i:s'),
            ]);

            $insert = $pdo->prepare(
                'INSERT INTO password_resets (
                    user_id,
                    email,
                    token_hash,
                    requested_ip,
                    requested_user_agent,
                    expires_at
                ) VALUES (
                    :user_id,
                    :email,
                    :token_hash,
                    :requested_ip,
                    :requested_user_agent,
                    :expires_at
                )'
            );
            $insert->execute([
                'user_id' => (int) $user['id'],
                'email' => (string) $user['email'],
                'token_hash' => $tokenHash,
                'requested_ip' => client_ip(),
                'requested_user_agent' => client_user_agent(),
                'expires_at' => $expiresAt,
            ]);

            $pdo->commit();

            $resetUrl = build_site_url('/resetar-senha.html?token=' . rawurlencode($token));
            $emailContent = password_reset_email($user, $resetUrl, $expiresMinutes);

            if (!send_html_mail((string) $user['email'], $emailContent['subject'], $emailContent['html'], $emailContent['text'])) {
                error_log('Falha ao enviar e-mail de redefinição de senha para user_id=' . (int) $user['id']);
            }
        }
    }

    $elapsed = microtime(true) - $requestStartedAt;
    if ($elapsed < 0.35) {
        usleep((int) ((0.35 - $elapsed) * 1000000));
    }

    json_response([
        'ok' => true,
        'message' => $genericMessage,
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
            'Não foi possível iniciar a redefinição agora. Tente novamente em instantes.'
        ),
    ], 500);
}
