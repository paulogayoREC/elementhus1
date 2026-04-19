<?php

declare(strict_types=1);

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection instanceof PDO) {
            return self::$connection;
        }

        $config = require dirname(__DIR__) . '/config/database.php';
        foreach (['host', 'name', 'user'] as $requiredKey) {
            if (empty($config[$requiredKey])) {
                throw new RuntimeException('Configuração do banco de dados incompleta.');
            }
        }

        $password = (string) ($config['pass'] ?? '');
        $usesHostingerDefaults = (
            (string) $config['name'] === 'u994269801_bd_eat'
            || (string) $config['user'] === 'u994269801_paulogayo'
        );

        if (
            str_contains($password, 'COLOQUE_A_SENHA')
            || str_contains($password, 'SENHA_DO_MYSQL')
            || ($usesHostingerDefaults && $password === '')
        ) {
            throw new RuntimeException('Senha do banco de dados não configurada.');
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $config['host'],
            $config['port'] ?: '3306',
            $config['name'],
            $config['charset'] ?: 'utf8mb4'
        );

        self::$connection = new PDO($dsn, (string) $config['user'], $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        return self::$connection;
    }
}
