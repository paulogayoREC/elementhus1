<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';
require dirname(__DIR__) . '/app/Database.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET');
    json_response([
        'ok' => false,
        'message' => 'Método não permitido.',
    ], 405);
}

try {
    $pdo = Database::connection();
    $pdo->query('SELECT 1');

    try {
        $pdo->query('SELECT id FROM users WHERE 1 = 0');
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        json_response([
            'ok' => false,
            'stage' => 'users_table',
            'message' => 'Conexão com o banco OK, mas a tabela users não foi encontrada ou está incompleta.',
        ], 500);
    }

    json_response([
        'ok' => true,
        'stage' => 'ready',
        'message' => 'Banco conectado e tabela users disponível.',
    ]);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    json_response([
        'ok' => false,
        'stage' => 'connection',
        'message' => 'Não foi possível conectar ao MySQL. Confira host, banco, usuário, senha e permissões.',
    ], 500);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    json_response([
        'ok' => false,
        'stage' => 'configuration',
        'message' => safe_database_error_message(
            $exception,
            'Configuração indisponível. Verifique se o arquivo private/database.php está no caminho correto.'
        ),
    ], 500);
}
