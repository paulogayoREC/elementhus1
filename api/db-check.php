<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';
require dirname(__DIR__) . '/app/Database.php';

function db_check_is_debug(): bool
{
    return ($_GET['debug'] ?? '') === '1';
}

function db_check_path_label(string $path): string
{
    $path = str_replace('\\', '/', $path);
    $documentRoot = (string) ($_SERVER['DOCUMENT_ROOT'] ?? '');

    if ($documentRoot !== '') {
        $documentRoot = str_replace('\\', '/', rtrim($documentRoot, '/\\'));

        if (strpos($path, $documentRoot) === 0) {
            return '{DOCUMENT_ROOT}' . substr($path, strlen($documentRoot));
        }
    }

    return $path;
}

function db_check_file_status(string $path): array
{
    return [
        'path' => db_check_path_label($path),
        'exists' => is_file($path),
        'readable' => is_readable($path),
    ];
}

function db_check_password_status(string $password): string
{
    if ($password === '') {
        return 'empty';
    }

    if (
        strpos($password, 'COLOQUE_A_SENHA') !== false
        || strpos($password, 'SENHA_DO_MYSQL') !== false
        || strpos($password, 'SUA_SENHA_REAL') !== false
    ) {
        return 'placeholder';
    }

    return 'set';
}

function db_check_private_config_paths(): array
{
    $projectRoot = dirname(__DIR__);
    $paths = [];

    $addPath = static function (string $path) use (&$paths): void {
        $path = str_replace('\\', '/', trim($path));

        if ($path !== '' && !in_array($path, $paths, true)) {
            $paths[] = $path;
        }
    };

    $configuredPath = getenv('DB_CONFIG_PATH');
    if ($configuredPath !== false && $configuredPath !== '') {
        $addPath($configuredPath);
    }

    $addPath($projectRoot . '/private/database.php');
    $addPath(dirname($projectRoot) . '/private/database.php');

    $hostName = strtolower((string) ($_SERVER['HTTP_HOST'] ?? 'encontreaquitech.com'));
    $hostName = preg_replace('/:\d+$/', '', $hostName) ?: 'encontreaquitech.com';
    $hostName = preg_replace('/[^a-z0-9.-]/', '', $hostName) ?: 'encontreaquitech.com';
    $hostNames = [$hostName, preg_replace('/^www\./', '', $hostName), 'encontreaquitech.com'];
    $hostNames = array_values(array_unique(array_filter($hostNames)));

    foreach ($hostNames as $domainName) {
        $addPath($projectRoot . '/domains/' . $domainName . '/private/database.php');
        $addPath(dirname($projectRoot) . '/domains/' . $domainName . '/private/database.php');
    }

    $documentRoot = (string) ($_SERVER['DOCUMENT_ROOT'] ?? '');
    if ($documentRoot !== '') {
        $documentRoot = rtrim($documentRoot, '/\\');
        $addPath($documentRoot . '/private/database.php');
        $addPath(dirname($documentRoot) . '/private/database.php');

        foreach ($hostNames as $domainName) {
            $addPath($documentRoot . '/domains/' . $domainName . '/private/database.php');
            $addPath(dirname($documentRoot) . '/domains/' . $domainName . '/private/database.php');
        }
    }

    return $paths;
}

function db_check_private_config_status(string $path): array
{
    $status = db_check_file_status($path);

    if (!$status['exists'] || !$status['readable']) {
        return $status;
    }

    try {
        $config = require $path;
    } catch (Throwable $exception) {
        $status['php_error'] = $exception->getMessage();
        return $status;
    }

    $status['returns_array'] = is_array($config);

    if (is_array($config)) {
        $status['db_host'] = (string) ($config['DB_HOST'] ?? '');
        $status['db_name'] = (string) ($config['DB_NAME'] ?? '');
        $status['db_user'] = (string) ($config['DB_USER'] ?? '');
        $status['db_pass_status'] = db_check_password_status((string) ($config['DB_PASS'] ?? ''));
    }

    return $status;
}

function db_check_diagnostics(?Throwable $exception = null): array
{
    $projectRoot = dirname(__DIR__);
    $diagnostics = [
        'document_root' => db_check_path_label((string) ($_SERVER['DOCUMENT_ROOT'] ?? '')),
        'project_root' => db_check_path_label($projectRoot),
        'required_files' => [
            'config/database.php' => db_check_file_status($projectRoot . '/config/database.php'),
            'app/Database.php' => db_check_file_status($projectRoot . '/app/Database.php'),
            'app/bootstrap.php' => db_check_file_status($projectRoot . '/app/bootstrap.php'),
        ],
        'private_config_candidates' => array_map(
            'db_check_private_config_status',
            db_check_private_config_paths()
        ),
    ];

    if ($exception) {
        $diagnostics['exception'] = [
            'class' => get_class($exception),
            'message' => $exception->getMessage(),
        ];
    }

    return $diagnostics;
}

function db_check_response(array $payload, int $statusCode = 200, ?Throwable $exception = null): void
{
    if (db_check_is_debug()) {
        $payload['debug'] = db_check_diagnostics($exception);
    }

    json_response($payload, $statusCode);
}

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
        db_check_response([
            'ok' => false,
            'stage' => 'users_table',
            'message' => 'Conexão com o banco OK, mas a tabela users não foi encontrada ou está incompleta.',
        ], 500, $exception);
    }

    try {
        $pdo->query('SELECT id FROM password_resets WHERE 1 = 0');
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        db_check_response([
            'ok' => false,
            'stage' => 'password_resets_table',
            'message' => 'Conexão com o banco OK, mas a tabela password_resets não foi encontrada ou está incompleta.',
        ], 500, $exception);
    }

    db_check_response([
        'ok' => true,
        'stage' => 'ready',
        'message' => 'Banco conectado e tabelas users/password_resets disponíveis.',
    ]);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    db_check_response([
        'ok' => false,
        'stage' => 'connection',
        'message' => 'Não foi possível conectar ao MySQL. Confira host, banco, usuário, senha e permissões.',
    ], 500, $exception);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    db_check_response([
        'ok' => false,
        'stage' => 'configuration',
        'message' => safe_database_error_message(
            $exception,
            'Configuração indisponível. Verifique se o arquivo private/database.php está no caminho correto.'
        ),
    ], 500, $exception);
}
