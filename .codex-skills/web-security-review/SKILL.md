---
name: web-security-review
description: revisar segurança web: login, sessão, cookies, inputs, uploads, APIs, XSS, CSRF, rate limit e secrets.
---

# Web Security Review

## Objetivo

Ajudar o Codex a revisar riscos de segurança em projetos web sem alterar funcionalidades desnecessariamente.

## Regras

- Validar inputs no frontend e backend quando aplicável.
- Sanitizar conteúdo enviado por usuário.
- Evitar XSS.
- Verificar autorização em rotas protegidas.
- Não expor secrets, tokens ou variáveis sensíveis.
- Usar cookies e sessões de forma segura.
- Proteger formulários contra spam e abuso.
- Revisar links externos.
- Não enfraquecer autenticação para resolver bug.

## Checklist

- Inputs têm validação?
- Conteúdo do usuário é sanitizado?
- Existe limite de tamanho?
- Existe rate limit?
- Rotas sensíveis exigem autenticação?
- Usuário só acessa o que pode acessar?
- Secrets estão fora do código?
- Erros não vazam dados internos?
- Links externos usam proteção adequada?

## Resposta final

Informar:

- riscos encontrados;
- mudanças aplicadas;
- arquivos alterados;
- pontos que exigem atenção manual.
