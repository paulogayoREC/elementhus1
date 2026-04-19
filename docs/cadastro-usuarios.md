# Cadastro de usuários do Encontre Aqui Tech

## Estrutura criada

- `api/session.php`: inicia sessão segura e entrega o token CSRF.
- `api/register.php`: valida e cadastra novos usuários.
- `api/login.php`: autentica usuários existentes.
- `api/logout.php`: encerra a sessão.
- `app/bootstrap.php`: sessão, respostas JSON, CSRF e validações comuns.
- `app/Database.php`: conexão PDO com MySQL.
- `config/database.php`: lê credenciais por variável de ambiente ou arquivo privado.
- `config/database.private.example.php`: modelo de configuração privada.
- `config/legal.php`: versões dos Termos, Política e dados de contato para o fluxo de aceite.
- `database/schema.sql`: SQL para criar a tabela `users`.
- `database/migrations/20260419_add_terms_acceptance_fields.sql`: migração para bancos já criados antes dos campos de aceite.
- `assets/js/auth.js`: modal de Login/Cadastro e validação no front-end.
- `app/.htaccess`, `config/.htaccess` e `database/.htaccess`: bloqueiam acesso direto às pastas internas na Hostinger.

## SQL para criar a tabela

Execute no phpMyAdmin da Hostinger:

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  terms_accepted TINYINT(1) NOT NULL DEFAULT 0,
  terms_accepted_at DATETIME NULL,
  terms_version VARCHAR(32) NULL,
  privacy_version VARCHAR(32) NULL,
  terms_accepted_ip VARCHAR(45) NULL,
  terms_accepted_user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email),
  KEY users_created_at_index (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

O mesmo SQL está em `database/schema.sql`.

Se a tabela `users` já existir, execute primeiro a migração:

```sql
ALTER TABLE users
  ADD COLUMN terms_accepted_at DATETIME NULL AFTER terms_accepted,
  ADD COLUMN terms_version VARCHAR(32) NULL AFTER terms_accepted_at,
  ADD COLUMN privacy_version VARCHAR(32) NULL AFTER terms_version,
  ADD COLUMN terms_accepted_ip VARCHAR(45) NULL AFTER privacy_version,
  ADD COLUMN terms_accepted_user_agent VARCHAR(255) NULL AFTER terms_accepted_ip;
```

O mesmo script está em `database/migrations/20260419_add_terms_acceptance_fields.sql`.

## Onde personalizar Termos e Privacidade

Atualize `config/legal.php` quando mudar versão, contato ou responsável:

```php
return [
    'site_name' => 'Encontre Aqui Tech',
    'domain' => 'encontreaquitech.com',
    'responsible_name' => 'Paulo Gayo',
    'contact_email' => 'contato@encontreaquitech.com',
    'privacy_email' => 'privacidade@encontreaquitech.com',
    'terms_version' => '2026-04-19',
    'privacy_version' => '2026-04-19',
    'effective_date' => '2026-04-19',
];
```

Revise também os textos públicos em:

```txt
termos-de-uso/index.html
politica-de-privacidade/index.html
```

## Onde colocar DB_HOST, DB_NAME, DB_USER e DB_PASS

Não coloque senha real no GitHub.

Na Hostinger, crie um arquivo privado chamado:

```txt
private/database.php
```

Você pode colocar essa pasta `private` na raiz do projeto ou, melhor ainda, um nível acima da pasta pública do domínio. Na Hostinger, prefira algo como `domains/encontreaquitech.com/private/database.php`, deixando `public_html` apenas para os arquivos públicos.

Conteúdo do arquivo:

```php
<?php

declare(strict_types=1);

return [
    'DB_HOST' => 'localhost',
    'DB_PORT' => '3306',
    'DB_NAME' => 'u994269801_bd_eat',
    'DB_USER' => 'u994269801_paulogayo',
    'DB_PASS' => 'SENHA_DO_MYSQL_DA_HOSTINGER_AQUI',
];
```

Na Hostinger, esses dados ficam em:

```txt
hPanel > Bancos de dados > Bancos de dados MySQL
```

Também é possível usar variáveis de ambiente com os mesmos nomes:

```txt
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASS
```

Para o domínio `encontreaquitech.com`, o projeto já está preparado para usar:

```txt
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u994269801_bd_eat
DB_USER=u994269801_paulogayo
```

Você ainda precisa preencher `DB_PASS` com a senha do usuário MySQL criada no hPanel da Hostinger. Não publique essa senha no GitHub.

## Como publicar na Hostinger

1. Faça upload dos arquivos do site para a pasta pública do domínio, normalmente `public_html`.
2. No hPanel, crie o banco em `Bancos de dados > Bancos de dados MySQL`.
3. Abra o phpMyAdmin e execute `database/schema.sql`.
4. Crie o arquivo `private/database.php` com as credenciais reais. Prefira criar esse arquivo um nível acima de `public_html`, por exemplo `domains/encontreaquitech.com/private/database.php`.
5. Acesse `https://encontreaquitech.com`.
6. Clique em `Login` no menu.
7. Abra `Criar conta`, preencha os dados e confirme o cadastro.

Depois do cadastro, o sistema inicia a sessão automaticamente.

## Erro "Configuração indisponível"

Essa mensagem aparece quando o PHP não encontrou os dados completos do MySQL. Confira:

```txt
DB_HOST=localhost
DB_NAME=u994269801_bd_eat
DB_USER=u994269801_paulogayo
DB_PASS=senha real do usuário MySQL
```

Se `DB_PASS` ainda estiver como `COLOQUE_A_SENHA...` ou estiver vazio, o cadastro não vai conectar ao banco.

Se a senha estiver correta e o erro mudar para conexão/consulta, confirme também se a tabela `users` foi criada no phpMyAdmin usando `database/schema.sql`.

## Como testar localmente

Você precisa de PHP com as extensões `pdo` e `pdo_mysql`, além de um MySQL local.

1. Crie um banco local, por exemplo:

```sql
CREATE DATABASE encontreaquitech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Execute o arquivo:

```txt
database/schema.sql
```

3. Crie `private/database.php` com os dados locais:

```php
<?php

declare(strict_types=1);

return [
    'DB_HOST' => '127.0.0.1',
    'DB_PORT' => '3306',
    'DB_NAME' => 'encontreaquitech',
    'DB_USER' => 'root',
    'DB_PASS' => '',
];
```

4. Rode o servidor local na raiz do projeto:

```bash
php -S localhost:8000
```

5. Acesse:

```txt
http://localhost:8000
```

O cadastro não funciona abrindo o `index.html` diretamente pelo navegador, porque os endpoints PHP precisam do servidor PHP ativo.

## Segurança aplicada

- PDO com prepared statements.
- `password_hash()` para senha.
- Senha nunca é salva em texto puro.
- Validação no front-end e no back-end.
- Bloqueio de e-mail duplicado por validação e índice `UNIQUE`.
- Token CSRF nas ações de login, cadastro e logout.
- Cookie de sessão com `HttpOnly`, `SameSite=Lax` e `Secure` quando estiver em HTTPS.
- Saídas de usuário no front-end feitas com `textContent`.
