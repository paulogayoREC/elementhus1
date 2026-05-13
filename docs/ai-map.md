# AI Map

Mapa curto para orientar o Codex no projeto `encontreaquitech.com` sem carregar o repositorio inteiro.

## Regra de economia

- Comece por este arquivo, `AGENTS.md` e no maximo 3 a 5 arquivos diretamente relacionados.
- Em arquivos grandes, busque por seletor, slug, titulo, rota, funcao ou mensagem de erro antes de abrir trechos longos.
- Abra regras detalhadas apenas quando a tarefa tocar a area correspondente.

## Stack

- Site HTML estatico com PHP procedural.
- CSS global: `assets/css/styles.css`.
- JavaScript vanilla em `assets/js/`.
- APIs PHP em `api/`; helpers em `app/`.
- Banco MySQL/MariaDB via PDO.
- Sem `package.json`, npm, Composer, Tailwind ou framework front-end.

## Entradas por tipo de tarefa

- Home: `index.html`, `assets/js/main.js`, `assets/css/styles.css`.
- Paginas editoriais: `noticias.html`, `novidades-tecnologicas.html`, `curiosidades.html`, `alertas-seguranca.html`, `tutoriais.html`.
- Regras editoriais: `docs/regras-editoriais.md`.
- Indicacoes/produtos: `indicacoes.html`, `indicacoes/*.html`, `assets/js/tech-showcase.js`.
- Regras da Vitrine Tech: `docs/regras-vitrine-tech.md`.
- Login/cadastro/sessao: `assets/js/auth.js`, `api/login.php`, `api/register.php`, `api/session.php`, `app/bootstrap.php`.
- Comentarios: `assets/js/main.js`, `api/comments.php`, `api/article-comments.php`, `app/CommentStorage.php`, `app/ArticleCommentStorage.php`.
- Redefinicao de senha: `resetar-senha.html`, `assets/js/password-reset.js`, `api/request-password-reset.php`, `api/reset-password.php`, `app/PasswordResetStorage.php`.
- Banco: `database/schema.sql`, `database/migrations/*.sql`, `app/Database.php`, `config/database.php`.
- SEO e indexacao: paginas `.html`, `robots.txt`, `site.webmanifest`, `_headers`.
- Automacao editorial: `scripts/update-editorias.py`, `.github/workflows/update-editorias.yml`, `assets/js/editorial-data.js`.
- Modo manutencao: `manutencao.html`, `.htaccess`, `maintenance.flag`, `assets/css/styles.css`, `robots.txt`.

## Arquivos sensiveis

- Nao ler nem exibir secrets: `.env`, `.env.*`, `private/`.
- Evite alterar sem necessidade: `.htaccess`, `_headers`, `config/database.php`, `database/schema.sql`, `database/migrations/*.sql`.
- `assets/js/editorial-data.js` e gerado por automacao; editar apenas em tarefas editoriais/curadoria.

## Validacao rapida

- HTML/CSS/JS: abrir no navegador e conferir console quando possivel.
- PHP/API: usar `php -S localhost:8000` e testar o fluxo afetado.
- Editorias: conferir `docs/regras-editoriais.md`.
- Vitrine Tech: conferir `docs/regras-vitrine-tech.md`.
- Sem build/lint formal: o projeto nao tem `package.json`.
