<?php

declare(strict_types=1);

$privateConfig = [];
$projectRoot = dirname(__DIR__);
$privateConfigPaths = [];

$addPrivateConfigPath = static function (string $path) use (&$privateConfigPaths): void {
    $path = str_replace('\\', '/', trim($path));

    if ($path !== '' && !in_array($path, $privateConfigPaths, true)) {
        $privateConfigPaths[] = $path;
    }
};

$configuredPath = getenv('DB_CONFIG_PATH');
if ($configuredPath !== false && $configuredPath !== '') {
    $addPrivateConfigPath($configuredPath);
}

$addPrivateConfigPath($projectRoot . '/private/database.php');
$addPrivateConfigPath(dirname($projectRoot) . '/private/database.php');

$hostName = strtolower((string) ($_SERVER['HTTP_HOST'] ?? 'encontreaquitech.com'));
$hostName = preg_replace('/:\d+$/', '', $hostName) ?: 'encontreaquitech.com';
$hostName = preg_replace('/[^a-z0-9.-]/', '', $hostName) ?: 'encontreaquitech.com';
$hostNames = [$hostName, preg_replace('/^www\./', '', $hostName), 'encontreaquitech.com'];
$hostNames = array_values(array_unique(array_filter($hostNames)));

foreach ($hostNames as $domainName) {
    $addPrivateConfigPath($projectRoot . '/domains/' . $domainName . '/private/database.php');
    $addPrivateConfigPath(dirname($projectRoot) . '/domains/' . $domainName . '/private/database.php');
}

$documentRoot = (string) ($_SERVER['DOCUMENT_ROOT'] ?? '');
if ($documentRoot !== '') {
    $documentRoot = rtrim($documentRoot, '/\\');
    $addPrivateConfigPath($documentRoot . '/private/database.php');
    $addPrivateConfigPath(dirname($documentRoot) . '/private/database.php');
    foreach ($hostNames as $domainName) {
        $addPrivateConfigPath($documentRoot . '/domains/' . $domainName . '/private/database.php');
        $addPrivateConfigPath(dirname($documentRoot) . '/domains/' . $domainName . '/private/database.php');
    }
}

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
