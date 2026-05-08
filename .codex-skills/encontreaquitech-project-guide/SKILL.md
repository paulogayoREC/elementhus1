---
name: encontreaquitech-project-guide
description: Project-specific guide for working on the Encontre Aqui Tech website repository. Use when Codex edits, reviews, debugs, documents, or plans changes in this project, especially files under HTML pages, assets/css, assets/js, api, app, config, database, indicacoes, docs, or scripts.
---

# Encontre Aqui Tech Project Guide

Use this skill as the project map before making changes in this repository.

## First Moves

- Read `AGENTS.md` before editing. It contains mandatory editorial and Vitrine Tech rules.
- Prefer reading the local files over assuming framework conventions.
- Treat this as a static HTML plus PHP site, not a Node/React/Next project.
- Do not run package-manager commands unless a manifest is added later.
- Do not read, print, edit, or commit `private/database.php` or real credentials.
- Keep changes narrow. This project has duplicated HTML, so broad refactors are risky.

## Stack

- Frontend: static `.html` pages, global CSS, vanilla JavaScript.
- Backend: procedural PHP endpoints in `api/`.
- Shared PHP: `app/` files loaded with `require`.
- Database: MySQL/MariaDB through PDO.
- Server target: Apache/Hostinger, with `.htaccess` clean URL rewrites.
- Automation: Python script for editorial feed updates.
- CI: GitHub Actions workflow for `scripts/update-editorias.py`.
- No npm, yarn, pnpm, Vite, Next, Tailwind, Composer, or formal build pipeline is currently present.

## Directory Map

- `index.html`: homepage.
- root `*.html`: top-level routes/pages.
- `indicacoes/*.html`: product category pages used by Vitrine Tech.
- `assets/css/styles.css`: single global stylesheet.
- `assets/js/main.js`: shared UI behavior, editorial rendering, comments, menu, sharing.
- `assets/js/auth.js`: login/register modal and auth client.
- `assets/js/password-reset.js`: reset password page behavior.
- `assets/js/tech-showcase.js`: Vitrine Tech product rotation.
- `assets/js/editorial-data.js`: generated/editorial feed data used on the homepage.
- `assets/js/mundo-geek.js`: geek page motion/reveal behavior.
- `assets/js/collectibles-catalog.js`: collectibles catalog rendering.
- `api/`: public PHP endpoints.
- `app/`: PHP support code: bootstrap, database, mail, storage helpers.
- `config/`: public config defaults and legal metadata.
- `database/`: schema and manual migrations.
- `docs/`: project rules and operational docs.
- `scripts/`: local/GitHub automation scripts.
- `.github/workflows/update-editorias.yml`: scheduled editorials update.

## Routes

The `.htaccess` file serves clean URLs from matching `.html` files.

- `/` maps to `index.html`.
- `/noticias` maps to `noticias.html`.
- `/indicacoes/monitores` maps to `indicacoes/monitores.html`.

Preserve this model unless the user explicitly requests a routing change.

## Reusable UI Contracts

There is no component framework. Reuse happens through repeated HTML patterns, CSS classes, and `data-*` hooks.

Preserve these selectors unless intentionally changing the related feature:

- Header/menu: `.site-header`, `.nav-shell`, `[data-header]`, `[data-menu]`, `[data-menu-toggle]`.
- Auth: `[data-auth-open]`, `assets/js/auth.js`.
- Homepage comments: `[data-feedback-form]`, `[data-feedback-list]`, `[data-feedback-status]`.
- Article comments: `[data-article-comment-form]`, `[data-content-slug]`, `[data-content-title]`, `[data-article-comment-message]`, `[data-article-comment-count]`, `[data-article-comment-status]`, `[data-article-comment-list]`.
- Homepage editorial cards: `[data-editorial-feature]`, `[data-feature-slot]`, `[data-topic-list]`.
- Vitrine Tech: `[data-tech-picks-panel]`.
- Product cards consumed by Vitrine Tech: `.affiliate-product-card`, `.product-media img`, `.product-info h4`, `.product-buy-link`.
- Geek animations: `[data-geek-reveal]`, `[data-geek-tilt]`.

## Editorial Pages

For these pages, follow `docs/regras-editoriais.md` before editing content:

- `noticias.html`
- `novidades-tecnologicas.html`
- `curiosidades.html`
- `alertas-seguranca.html`
- `tutoriais.html`

When adding new editorial content:

- Make the new content the main featured article.
- Move the previous main article into the compact expandable archive.
- Keep at most 5 previous contents in `.article-archive-grid[data-archive-limit="5"]`.
- Preserve title, subtitle, added date, image, and comment form for featured and archived content.
- Keep stable `data-content-slug` values for existing articles so old comments remain attached.
- Do not label older content visually as secondary.
- Preserve the premium article treatment already established in `noticias.html`.

## Vitrine Tech

Follow `docs/regras-vitrine-tech.md` before changing products, categories, or homepage Vitrine Tech.

Key rules:

- The homepage must show exactly 5 products.
- Rotation is every 4 hours in `America/Recife`.
- Products come from published `indicacoes/*.html` pages.
- Products must not repeat within the same window or repeat items from the previous day when catalog size allows.
- Keep the static fallback cards in `index.html` for no-JS cases.
- When creating a new `indicacoes` category, add it to `sourcePages` in `assets/js/tech-showcase.js`.
- Preserve product selectors used by the scraper/parser.

## Backend And Data

API endpoints:

- `api/session.php`: session and CSRF token.
- `api/register.php`: account creation.
- `api/login.php`: login.
- `api/logout.php`: logout.
- `api/request-password-reset.php`: password reset request.
- `api/reset-password.php`: password reset submission.
- `api/comments.php`: homepage/community comments.
- `api/article-comments.php`: comments tied to editorial content.
- `api/db-check.php`: database diagnostics.

Shared backend files:

- `app/bootstrap.php`: JSON responses, session security, CSRF, validation, rate limiting, headers.
- `app/Database.php`: PDO connection.
- `app/Mailer.php`: HTML/text email through PHP `mail()`.
- `app/CommentStorage.php`: community comments table helper.
- `app/ArticleCommentStorage.php`: article comments table helper.
- `app/PasswordResetStorage.php`: reset-token table helper.

Database:

- Schema lives in `database/schema.sql`.
- Migrations live in `database/migrations/*.sql`.
- There is no ORM.
- Tables include `users`, `password_resets`, `community_comments`, and `article_comments`.

Security expectations:

- Keep prepared statements.
- Keep CSRF checks on state-changing requests.
- Keep rate limits and honeypot fields.
- Keep output user data sanitized or written with `textContent`.
- Do not expose IP, user-agent, e-mail, password hashes, tokens, or DB credentials in public responses.

## Styles

- Use `assets/css/styles.css` for global styles.
- Do not add Tailwind or a new CSS framework casually.
- Continue the existing class style: kebab-case class names, section-specific class groups, responsive media queries.
- Preserve global variables in `:root` unless changing design tokens intentionally.
- Check mobile breakpoints after layout changes because many pages share the same CSS.

## JavaScript Patterns

- Use vanilla JavaScript.
- Prefer `const` and `let`.
- Use `data-*` hooks for behavior.
- Keep API base URL logic based on `document.currentScript` when adding scripts that call `api/`.
- Use `fetch` with JSON for PHP endpoints.
- Preserve localStorage keys unless migrating data intentionally.

## Naming

- Files: kebab-case, especially HTML pages and category pages.
- CSS classes: kebab-case.
- JavaScript DOM hooks: `data-kebab-case`.
- PHP functions: snake_case.
- SQL tables/columns: snake_case.
- Content slugs: stable, descriptive, lowercase kebab-case.

## Commands

Run locally with PHP when API endpoints are needed:

```bash
php -S localhost:8000
```

Update editorial data manually:

```bash
python scripts/update-editorias.py
```

Commit/push helper scripts:

```bash
scripts/salvar-github.cmd "Mensagem do commit"
scripts/salvar-github.sh "Mensagem do commit"
```

There are no formal build, test, or lint commands at this time.

## Files To Avoid Changing Casually

- `private/database.php`: sensitive local credentials; do not inspect or edit.
- `.htaccess`: clean URLs and Apache behavior.
- `_headers`: CSP, cache, and security headers.
- `app/.htaccess`, `config/.htaccess`, `database/.htaccess`: deny direct public access.
- `config/database.php`: credential discovery logic.
- `database/schema.sql` and `database/migrations/*.sql`: production data impact.
- `assets/js/editorial-data.js`: generated by script/workflow.
- `assets/js/tech-showcase.js`: business-critical Vitrine Tech rotation.
- favicon, manifest, and image assets unless the task is visual/content maintenance.

## Risk Checklist

Before finishing a change, check for these risks:

- Clean URLs still work with `.htaccess`.
- CSP in `_headers` allows any new external resource.
- Auth and comments still fetch the correct PHP endpoints.
- Existing article `data-content-slug` values were not changed accidentally.
- Vitrine Tech still finds products via `.affiliate-product-card`, `.product-media img`, `.product-info h4`, and `.product-buy-link`.
- Editorial archive still has no more than 5 previous items.
- New images have correct relative paths, `alt`, `loading`, and `decoding` where appropriate.
- Pages under `indicacoes/` use `../assets/...` paths.
- No real credentials, tokens, or private files were touched.

## Verification Guidance

- For static-only edits, inspect the affected HTML/CSS/JS and test in browser when possible.
- For PHP/API changes, run with `php -S localhost:8000` and test endpoint behavior.
- For database-related changes, compare with `database/schema.sql` and the relevant migration.
- For editorial automation, run `python scripts/update-editorias.py` only when intentionally updating generated editorial data.
- If no automated tests exist for the touched area, state the manual verification performed and the remaining risk.
