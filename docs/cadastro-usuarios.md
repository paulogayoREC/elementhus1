# Cadastro de usuários do Encontre Aqui Tech

## Estrutura criada

- `api/session.php`: inicia sessão segura e entrega o token CSRF.
- `api/register.php`: valida e cadastra novos usuários.
- `api/login.php`: autentica usuários existentes.
- `api/request-password-reset.php`: recebe o e-mail e dispara link seguro de redefinição.
- `api/reset-password.php`: valida token de uso único e grava a nova senha.
- `api/comments.php`: lista e publica comentários/avaliações no MySQL.
- `api/logout.php`: encerra a sessão.
- `app/bootstrap.php`: sessão, respostas JSON, CSRF e validações comuns.
- `app/Database.php`: conexão PDO com MySQL.
- `app/Mailer.php`: envio de e-mails HTML/texto para recuperação de senha e confirmação de alteração.
- `app/PasswordResetStorage.php`: criação defensiva da tabela `password_resets` quando o fluxo de reset roda.
- `app/CommentStorage.php`: criação defensiva e payload público da tabela `community_comments`.
- `config/database.php`: lê credenciais por variável de ambiente ou arquivo privado.
- `config/database.private.example.php`: modelo de configuração privada.
- `config/legal.php`: versões dos Termos, Política e dados de contato para o fluxo de aceite.
- `database/schema.sql`: SQL para criar a tabela `users`.
- `database/migrations/20260420_create_password_resets_table.sql`: cria a tabela de tokens de redefinição.
- `database/migrations/20260420_create_community_comments_table.sql`: cria a tabela de comentários e avaliações.
- `database/migrations/20260419_add_terms_acceptance_fields.sql`: migração para bancos já criados antes dos campos de aceite.
- `assets/js/auth.js`: modal de Login/Cadastro e validação no front-end.
- `assets/js/password-reset.js`: formulário da página de nova senha.
- `resetar-senha.html`: página acessada pelo link enviado por e-mail.
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

CREATE TABLE IF NOT EXISTS password_resets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(190) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  requested_ip VARCHAR(45) NULL,
  requested_user_agent VARCHAR(255) NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY password_resets_token_hash_unique (token_hash),
  KEY password_resets_user_created_index (user_id, created_at),
  KEY password_resets_expires_at_index (expires_at),
  CONSTRAINT password_resets_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_comments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  name VARCHAR(48) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'published',
  submitted_ip VARCHAR(45) NULL,
  submitted_user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY community_comments_status_created_index (status, created_at),
  KEY community_comments_user_created_index (user_id, created_at),
  CONSTRAINT community_comments_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL
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

Para liberar o fluxo de "Esqueci minha senha", execute também:

```sql
CREATE TABLE IF NOT EXISTS password_resets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(190) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  requested_ip VARCHAR(45) NULL,
  requested_user_agent VARCHAR(255) NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY password_resets_token_hash_unique (token_hash),
  KEY password_resets_user_created_index (user_id, created_at),
  KEY password_resets_expires_at_index (expires_at),
  CONSTRAINT password_resets_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

O mesmo script está em `database/migrations/20260420_create_password_resets_table.sql`.

O endpoint também tenta criar essa tabela automaticamente se ela ainda não existir. Mesmo assim, manter a migração executada pelo phpMyAdmin é o caminho mais previsível em produção.

Para salvar comentários e avaliações no MySQL, execute:

```sql
CREATE TABLE IF NOT EXISTS community_comments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  name VARCHAR(48) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'published',
  submitted_ip VARCHAR(45) NULL,
  submitted_user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY community_comments_status_created_index (status, created_at),
  KEY community_comments_user_created_index (user_id, created_at),
  CONSTRAINT community_comments_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

O mesmo script está em `database/migrations/20260420_create_community_comments_table.sql`. O endpoint `api/comments.php` também tenta criar a tabela automaticamente se ela ainda não existir.

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

Se o site estiver publicado em `public_html/domains/encontreaquitech.com`, use:

```txt
public_html/domains/encontreaquitech.com/private/database.php
```

Também é possível colocar essa pasta `private` um nível acima da pasta pública do domínio. A configuração atual procura automaticamente os caminhos mais comuns da Hostinger.

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

## Envio de e-mail para redefinição de senha

O reset usa `mail()` do PHP e envia e-mail HTML com alternativa em texto puro. Na Hostinger, crie ou valide uma conta de e-mail do domínio antes de publicar o fluxo.

Variáveis opcionais:

```txt
EAT_MAIL_FROM=seguranca@encontreaquitech.com
EAT_MAIL_FROM_NAME=Encontre Aqui Tech
EAT_MAIL_REPLY_TO=contato@encontreaquitech.com
```

Se essas variáveis não existirem, o sistema usa `seguranca@encontreaquitech.com` como remetente e o `contact_email` de `config/legal.php` como resposta.

O link enviado aponta para:

```txt
https://encontreaquitech.com/resetar-senha.html?token=TOKEN_DE_USO_UNICO
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
6. Teste `https://encontreaquitech.com/api/db-check.php`.
7. Clique em `Login` no menu.
8. Abra `Criar conta`, preencha os dados e confirme o cadastro.

Depois do cadastro, o sistema inicia a sessão automaticamente.

## Teste de conexão com o banco

Depois de publicar os arquivos, abra:

```txt
https://encontreaquitech.com/api/db-check.php
```

Se estiver tudo certo, a resposta será parecida com:

```json
{"ok":true,"stage":"ready","message":"Banco conectado e tabela users disponível."}
```

Se a resposta citar `users_table`, a conexão funcionou, mas falta criar a tabela `users` no phpMyAdmin usando `database/schema.sql`.

Se a resposta citar `password_resets_table`, execute `database/migrations/20260420_create_password_resets_table.sql`.

Se a resposta citar `community_comments_table`, execute `database/migrations/20260420_create_community_comments_table.sql`.

Se a resposta citar `connection`, confira host, nome do banco, usuário, senha e permissões do usuário MySQL.

Se a resposta citar `configuration`, confira se `private/database.php` está no caminho correto e com `DB_PASS` preenchido.

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
- Mensagem genérica em login e reset para reduzir enumeração de contas.
- Reset de senha com token criptograficamente aleatório, salvo apenas como hash SHA-256.
- Link de redefinição com expiração de 30 minutos e uso único.
- Cooldown de 2 minutos por conta para reduzir abuso de envio de e-mails.
- Tempo mínimo de resposta no pedido de reset para reduzir diferença perceptível entre conta existente e inexistente.
- E-mail de confirmação após a senha ser alterada.
- Comentários e avaliações salvos em `community_comments`, com validação no servidor, CSRF no envio e limite simples de 3 comentários a cada 2 minutos por IP.
- Listagem pública limitada aos comentários com `status = published` e sem exposição de IP, user-agent ou e-mail.
- Cookie de sessão com `HttpOnly`, `SameSite=Lax` e `Secure` quando estiver em HTTPS.
- Saídas de usuário no front-end feitas com `textContent`.
