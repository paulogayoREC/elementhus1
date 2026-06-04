---
name: web-project-guide
description: trabalhar em projetos web mantendo estrutura, padrões e validação; use para entender repo, rotas, componentes e mudanças gerais.
---

# Web Project Guide

## Objetivo

Orientar mudanças no `encontreaquitech.com` com leitura seletiva, preservando estrutura, rotas, seletores e regras do projeto.

## Fluxo econômico

1. Leia `AGENTS.md` e `docs/ai-map.md`.
2. Identifique a área afetada: página, estilo, script, API, produto, editorial ou segurança.
3. Abra no máximo 3 a 5 arquivos relevantes no início.
4. Use busca por seletor, slug, rota, função ou erro antes de abrir arquivos grandes.
5. Faça a menor alteração segura.
6. Valide com o comando ou revisão adequada.

## Cuidados do projeto

- Site sem framework: HTML estático, CSS global, JavaScript vanilla e PHP procedural.
- Não há build/lint formal por `package.json`.
- Preserve URLs limpas, slugs, seletores `data-*`, login, comentários e Vitrine Tech.
- Não leia nem exponha `.env`, `.env.*` ou `private/`.
- Para editorias, leia `docs/regras-editoriais.md`.
- Para produtos/Vitrine Tech, leia `docs/regras-vitrine-tech.md`.

## Combinar quando necessário

- Contexto: `web-token-saver`.
- Erros técnicos: `web-build-debugger`.
- Performance: `web-performance-auditor`.
- SEO: `web-seo-content`.
- Interface: `web-ui-components`.
- Segurança: `web-security-review`.
- Afiliados/produtos: `web-affiliate-products`.
- Conteúdo editorial: `web-content-publisher`.
