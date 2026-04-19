<?php

declare(strict_types=1);

$privateConfig = [];
$privateConfigPaths = [
    dirname(__DIR__) . '/private/database.php',
    dirname(__DIR__, 2) . '/private/database.php',
];

foreach ($privateConfigPaths as $privateConfigPath) {
    if (is_file($privateConfigPath)) {
        $loadedConfig = require $privateConfigPath;
        if (is_array($loadedConfig)) {
            $privateConfig = $loadedConfig;
        }
        break;
    }
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
    'name' => $value('DB_NAME'),
    'user' => $value('DB_USER'),
    'pass' => $value('DB_PASS'),
    'charset' => 'utf8mb4',
];
