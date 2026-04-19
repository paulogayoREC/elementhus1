<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

require_post();
require_csrf();

unset($_SESSION['user']);
session_regenerate_id(true);
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

json_response([
    'ok' => true,
    'message' => 'Você saiu da sua conta.',
    'csrfToken' => csrf_token(),
    'user' => null,
]);
