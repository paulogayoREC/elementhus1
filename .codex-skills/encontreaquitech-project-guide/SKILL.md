---
name: encontreaquitech-project-guide

description: guia base do projeto encontreaquitech.com para orientar o codex ao trabalhar no código do site. use quando a tarefa envolver criar páginas, ajustar componentes, corrigir bugs, revisar rotas, alterar estilos, mexer em integrações, rodar comandos, revisar build, lint, testes ou entender a estrutura do repositório. esta skill deve fazer o codex seguir os padrões reais do projeto, evitar alterações desnecessárias e explicar claramente os arquivos modificados.
---

# EncontreAquiTech Project Guide

## Objetivo

Usar esta Skill como guia principal ao trabalhar no código do site `encontreaquitech.com`.

Antes de alterar qualquer arquivo, entender a estrutura atual do projeto, identificar o padrão existente e fazer mudanças mínimas, seguras e consistentes.

## Regras principais

1. Ler o projeto antes de alterar arquivos.
2. Preferir seguir padrões já existentes em vez de criar uma arquitetura nova.
3. Fazer a menor alteração possível para resolver a tarefa.
4. Não renomear pastas, arquivos, seletores, slugs ou rotas sem necessidade clara.
5. Não remover código aparentemente não usado sem confirmar impacto.
6. Não alterar configurações sensíveis sem explicar o motivo.
7. Não expor secrets, tokens, chaves de API, senhas ou conteúdo de arquivos `.env`/`private`.
8. Sempre informar quais arquivos foram alterados e por quê.
9. Sempre que possível, rodar validações compatíveis com este projeto.
10. Caso não consiga rodar algum comando, explicar o motivo.

## Antes de começar qualquer tarefa

Executar mentalmente este checklist:

- Qual é o objetivo exato da solicitação?
- A mudança envolve página, HTML repetido, estilo, rota, API, banco, formulário, comentário, produto ou configuração?
- Já existe algum arquivo parecido que deve ser usado como referência?
- Existe risco de quebrar layout, SEO, URL limpa, comentário, login, Vitrine Tech ou integração externa?
- É necessário rodar algum comando antes ou depois?
- A tarefa toca uma das regras obrigatórias de `AGENTS.md`, `docs/regras-editoriais.md` ou `docs/regras-vitrine-tech.md`?

## Stack do projeto

- Framework: nenhum framework front-end; site em HTML estático com PHP.
- Front-end: HTML, CSS puro e JavaScript vanilla.
- Back-end: PHP procedural com arquivos em `api/` e helpers em `app/`.
- Linguagens: HTML, CSS, JavaScript, PHP, SQL e Python para automação.
- Estilização: CSS global em `assets/css/styles.css`; não usa Tailwind.
- Gerenciador de pacotes: nenhum. Não há `package.json`, npm, yarn, pnpm ou Composer.
- Banco de dados: MySQL/MariaDB via PDO.
- ORM: nenhum.
- Ambiente de deploy: Apache/Hostinger, com `.htaccess` e arquivos de segurança por pasta.
- CI/automação: GitHub Actions roda `scripts/update-editorias.py`.

## Estrutura do projeto

- Páginas principais:
  - `index.html`: página inicial.
  - `noticias.html`
  - `novidades-tecnologicas.html`
  - `curiosidades.html`
  - `alertas-seguranca.html`
  - `tutoriais.html`
  - `indicacoes.html`
  - `mundo-geek.html`
  - `colecionaveis-geek.html`
  - `resetar-senha.html`

- Páginas de produtos:
  - `indicacoes/*.html`
  - Essas páginas alimentam a Vitrine Tech da página inicial.

- Componentes reutilizáveis:
  - Não existe pasta `components/`.
  - A reutilização é feita por padrões repetidos de HTML, classes CSS e atributos `data-*`.
  - Exemplos: header, menu, cards editoriais, cards de produto, formulários de comentário, modal de login.

- Estilos:
  - `assets/css/styles.css`: CSS global único.
  - Não criar Tailwind, Bootstrap ou outra camada de CSS sem pedido explícito.

- JavaScript:
  - `assets/js/main.js`: menu, animações, comentários, cards editoriais, compartilhamento e comportamentos gerais.
  - `assets/js/auth.js`: modal de login/cadastro, sessão e fluxo de autenticação no front-end.
  - `assets/js/password-reset.js`: página de redefinição de senha.
  - `assets/js/tech-showcase.js`: rotação da Vitrine Tech.
  - `assets/js/editorial-data.js`: dados editoriais gerados/atualizados por script.
  - `assets/js/mundo-geek.js`: efeitos do Mundo Geek.
  - `assets/js/collectibles-catalog.js`: catálogo de colecionáveis.

- APIs:
  - `api/session.php`
  - `api/register.php`
  - `api/login.php`
  - `api/logout.php`
  - `api/request-password-reset.php`
  - `api/reset-password.php`
  - `api/comments.php`
  - `api/article-comments.php`
  - `api/db-check.php`

- Backend compartilhado:
  - `app/bootstrap.php`: sessão, JSON, CSRF, headers, validações e rate limit.
  - `app/Database.php`: conexão PDO.
  - `app/Mailer.php`: envio de e-mail com `mail()`.
  - `app/CommentStorage.php`: comentários gerais.
  - `app/ArticleCommentStorage.php`: comentários por matéria/conteúdo.
  - `app/PasswordResetStorage.php`: tokens de redefinição de senha.

- Banco de dados:
  - `database/schema.sql`: schema consolidado.
  - `database/migrations/*.sql`: migrações manuais.

- Configurações:
  - `config/database.php`: resolução de credenciais por env ou arquivo privado.
  - `config/database.private.example.php`: exemplo seguro.
  - `config/legal.php`: dados legais, versões dos termos e contatos.

- Documentação/regras:
  - `AGENTS.md`
  - `docs/regras-editoriais.md`
  - `docs/regras-vitrine-tech.md`
  - `docs/cadastro-usuarios.md`

- Automação:
  - `scripts/update-editorias.py`
  - `scripts/salvar-github.ps1`
  - `scripts/salvar-github.cmd`
  - `scripts/salvar-github.sh`
  - `.github/workflows/update-editorias.yml`

## Rotas e páginas

As rotas são arquivos `.html` servidos com URLs limpas por `.htaccess`.

- `/` serve `index.html`.
- `/noticias` serve `noticias.html`.
- `/indicacoes/monitores` serve `indicacoes/monitores.html`.

Preservar a lógica do `.htaccess` ao alterar páginas ou links internos.

Em páginas dentro de `indicacoes/`, usar caminhos relativos com `../assets/...`.

## Padrões de HTML e seletores

Preservar seletores usados pelo JavaScript:

- Menu/header:
  - `[data-header]`
  - `[data-menu]`
  - `[data-menu-toggle]`
  - `.site-header`
  - `.nav-shell`

- Autenticação:
  - `[data-auth-open]`
  - `[data-auth-open-panel]`

- Comentários da página inicial:
  - `[data-feedback-form]`
  - `[data-feedback-list]`
  - `[data-feedback-status]`
  - `[data-feedback-message]`
  - `[data-feedback-count]`

- Comentários de matérias:
  - `[data-article-comment-form]`
  - `[data-content-slug]`
  - `[data-content-title]`
  - `[data-article-comment-message]`
  - `[data-article-comment-count]`
  - `[data-article-comment-status]`
  - `[data-article-comment-list]`

- Editorias da home:
  - `[data-editorial-feature]`
  - `[data-feature-slot]`
  - `[data-topic-list]`

- Vitrine Tech:
  - `[data-tech-picks-panel]`
  - `.affiliate-product-card`
  - `.product-media img`
  - `.product-info h4`
  - `.product-buy-link`

- Mundo Geek:
  - `[data-geek-reveal]`
  - `[data-geek-tilt]`

Não trocar esses seletores sem atualizar também os scripts dependentes.

## Regras editoriais

Antes de alterar estas páginas, ler `docs/regras-editoriais.md`:

- `noticias.html`
- `novidades-tecnologicas.html`
- `curiosidades.html`
- `alertas-seguranca.html`
- `tutoriais.html`

Ao adicionar novo conteúdo:

- O novo conteúdo sempre vira o destaque principal.
- O destaque principal precisa ter título, subtítulo, data de adição, imagem e formulário de comentário.
- O destaque anterior deve descer para a área compacta expansível.
- A área compacta usa `.article-archive-grid[data-archive-limit="5"]`.
- Manter no máximo 5 conteúdos anteriores.
- Não classificar visualmente conteúdos anteriores como secundários.
- Preservar slugs existentes em `data-content-slug`, pois eles vinculam comentários já publicados.
- Manter imagens antigas com `loading="lazy"` e `decoding="async"` quando aplicável.
- Usar `noticias.html` como referência visual premium.

## Regra da Vitrine Tech

Antes de alterar produtos, categorias, `index.html` ou `assets/js/tech-showcase.js`, ler `docs/regras-vitrine-tech.md`.

Regras obrigatórias:

- A página inicial deve exibir exatamente 5 produtos.
- A troca acontece a cada 4 horas no fuso `America/Recife`.
- A seleção vem das páginas `indicacoes/*.html`.
- Não pode repetir produtos dentro da mesma janela.
- Sempre que houver catálogo suficiente, não deve repetir produtos exibidos no dia anterior.
- O HTML estático em `index.html` deve permanecer como fallback caso o JavaScript não carregue.
- Ao criar nova categoria de indicação, incluir a página no array `sourcePages` em `assets/js/tech-showcase.js`.
- Preservar `.affiliate-product-card`, `.product-media img`, `.product-info h4` e `.product-buy-link`.

## Banco de dados e API

O projeto usa MySQL via PDO, sem ORM.

Tabelas principais:

- `users`
- `password_resets`
- `community_comments`
- `article_comments`

Cuidados:

- Manter prepared statements.
- Manter `require_csrf()` em ações que alteram estado.
- Manter rate limits e honeypot.
- Não retornar e-mail, IP, user-agent, hash de senha ou token em payload público.
- Em mudanças de schema, atualizar `database/schema.sql` e criar/ajustar migration quando necessário.
- Testar endpoints via servidor PHP local quando possível.

## Comandos do projeto

Não há comandos de build, lint ou test configurados em `package.json`, pois não existe `package.json`.

Rodar localmente quando precisar de PHP/API:

```bash
php -S localhost:8000
```

Atualizar editorias manualmente:

```bash
python scripts/update-editorias.py
```

Salvar no GitHub pelos scripts existentes:

```bash
scripts/salvar-github.cmd "Mensagem do commit"
```

```bash
scripts/salvar-github.sh "Mensagem do commit"
```

Diagnóstico de banco em ambiente servido:

```text
/api/db-check.php
```

Se o usuário pedir build/lint/test, explicar que o projeto ainda não possui esses scripts formais e oferecer validação alternativa adequada ao tipo de mudança.

## Padrões de nomenclatura

- Arquivos HTML: kebab-case, por exemplo `alertas-seguranca.html`.
- Categorias de indicação: kebab-case em `indicacoes/`.
- Classes CSS: kebab-case.
- Atributos de comportamento: `data-kebab-case`.
- Funções PHP: snake_case.
- Tabelas e colunas SQL: snake_case.
- Slugs de conteúdo: lowercase kebab-case, estáveis e descritivos.
- JavaScript: preferir `const`/`let`, funções pequenas e DOM APIs nativas.

## Arquivos que não devem ser alterados sem necessidade

- `private/database.php`: credenciais reais; não ler, não exibir e não alterar.
- `.env` e `.env.*`: secrets; não ler nem exibir.
- `.htaccess`: URLs limpas e regras Apache.
- `_headers`: CSP, cache e cabeçalhos de segurança.
- `app/.htaccess`, `config/.htaccess`, `database/.htaccess`: bloqueio de acesso público.
- `config/database.php`: resolução de credenciais.
- `database/schema.sql` e `database/migrations/*.sql`: impacto direto em produção.
- `assets/js/editorial-data.js`: arquivo gerado por automação, mexer apenas quando a tarefa for editorial/curadoria.
- `assets/js/tech-showcase.js`: regra crítica da Vitrine Tech.
- Favicons, manifesto e imagens de marca, salvo mudança visual solicitada.

## Riscos ao alterar o projeto

- Quebrar URLs limpas ao mexer em `.htaccess`.
- Quebrar CSP ou carregamento de recursos externos ao alterar `_headers`.
- Quebrar login, cadastro, sessão ou comentários ao alterar `auth.js`, `main.js`, `bootstrap.php` ou endpoints em `api/`.
- Perder vínculo de comentários ao renomear `data-content-slug`.
- Quebrar a Vitrine Tech ao mudar estrutura dos cards de produto.
- Quebrar páginas em `indicacoes/` por usar caminho `assets/...` em vez de `../assets/...`.
- Criar inconsistência visual por mudar um HTML repetido e esquecer páginas similares.
- Perder alteração manual em `assets/js/editorial-data.js` quando o workflow atualizar o arquivo.
- Introduzir dependência de Node/Tailwind/Composer sem infraestrutura do projeto.

## Validação antes de finalizar

Escolher validação conforme a mudança:

- HTML/CSS/JS estático: revisar no navegador e conferir console quando possível.
- Alteração de rota/link: conferir URL limpa esperada.
- API/PHP: rodar `php -S localhost:8000` e testar endpoint ou fluxo afetado.
- Banco: comparar com `database/schema.sql` e migrations.
- Editorias: conferir regras de destaque, arquivo, slug, imagem, data e limite de 5 arquivos anteriores.
- Vitrine Tech: verificar 5 produtos, `sourcePages`, seletores dos cards e fallback no `index.html`.

Se não houver teste automatizado para a área, informar a validação manual realizada e o risco restante.

## Resposta final esperada

Ao concluir uma tarefa neste projeto, explicar de forma objetiva:

- Quais arquivos foram alterados.
- Por que cada alteração foi feita.
- Quais comandos/validações foram executados.
- Quais comandos não puderam ser executados e por quê.
- Qual risco residual ainda existe, se houver.
