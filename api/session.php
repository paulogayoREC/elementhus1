<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

json_response([
    'ok' => true,
    'csrfToken' => csrf_token(),
    'user' => $_SESSION['user'] ?? null,
]);
