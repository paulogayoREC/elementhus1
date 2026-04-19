<?php

declare(strict_types=1);

$privateConfig = [];
$privateConfigPaths = [
    dirname(__DIR__, 2) . '/private/database.php',
    dirname(__DIR__) . '/private/database.php',
];

$hasUsableDatabasePassword = static function (array $config): bool {
    $password = (string) ($config['DB_PASS'] ?? '');

    return $password !== ''
        && strpos($password, 'COLOQUE_A_SENHA') === false
        && strpos($password, 'SENHA_DO_MYSQL') === false
        && strpos($password, 'SUA_SENHA_REAL') === false;
};

$fallbackPrivateConfig = [];

foreach ($privateConfigPaths as $privateConfigPath) {
    if (is_file($privateConfigPath)) {
        $loadedConfig = require $privateConfigPath;
        if (is_array($loadedConfig)) {
            if ($fallbackPrivateConfig === []) {
                $fallbackPrivateConfig = $loadedConfig;
            }

            if ($hasUsableDatabasePassword($loadedConfig)) {
                $privateConfig = $loadedConfig;
                break;
            }
        }
    }
}

if ($privateConfig === []) {
    $privateConfig = $fallbackPrivateConfig;
}

$value = static function (string $key, string $default = '') use ($privateConfig): string {
    $envValue = getenv($key);
    if ($envValue !== false && $envValue !== '') {
        return $envValue;
    }

    if (isset($privateConfig[$key]) && $privateConfig[$key] !== '') {
        return (string) $privateConfig[$key];
    }

    return $default;
};

return [
    'host' => $value('DB_HOST', 'localhost'),
    'port' => $value('DB_PORT', '3306'),
    'name' => $value('DB_NAME', 'u994269801_bd_eat'),
    'user' => $value('DB_USER', 'u994269801_paulogayo'),
    'pass' => $value('DB_PASS'),
    'charset' => 'utf8mb4',
];
