# Encontre Aqui Tech - Guia rapido para Codex

Use estas regras para trabalhar no projeto com baixo consumo de contexto.

## Ordem de leitura

1. Leia este arquivo.
2. Leia `docs/ai-map.md`.
3. Abra apenas os 3 a 5 arquivos diretamente relacionados a tarefa.
4. Abra regras detalhadas somente quando a tarefa exigir.

## Skills locais

As skills ativas ficam em `.codex-skills/`.

- Base: `web-project-guide` + `web-token-saver`.
- Debug: `web-build-debugger`.
- Performance: `web-performance-auditor`.
- SEO: `web-seo-content`.
- UI: `web-ui-components`.
- Seguranca: `web-security-review`.
- Produtos/Vitrine Tech: `web-affiliate-products`.
- Conteudo editorial: `web-content-publisher`.

Combine apenas as skills necessarias para a tarefa atual.

## Regras de economia

- Nao leia o repositorio inteiro.
- Use busca por nome, rota, seletor, slug, funcao ou erro antes de abrir arquivos grandes.
- Nao cole arquivos completos na resposta final.
- Nao reescreva arquivos inteiros quando uma edicao pontual resolver.
- Evite refatoracoes ou mudancas globais sem pedido explicito.

## Regras do projeto

- Projeto sem framework front-end: HTML estatico, CSS global, JavaScript vanilla e PHP procedural.
- Nao ha `package.json`, npm, Composer, Tailwind, build ou lint formal.
- Preservar URLs limpas, seletores `data-*`, slugs, comentarios, login e Vitrine Tech.
- Nao ler, exibir ou alterar secrets em `.env`, `.env.*` ou `private/`.

## Regras detalhadas sob demanda

- Tarefas editoriais: leia `docs/regras-editoriais.md`.
- Vitrine Tech, produtos ou indicacoes: leia `docs/regras-vitrine-tech.md`.
- Cadastro, login ou usuarios: leia `docs/cadastro-usuarios.md` somente se necessario.

## Validacao

- HTML/CSS/JS: revisar no navegador e console quando possivel.
- PHP/API: usar `php -S localhost:8000` e testar o fluxo afetado.
- Editorias e Vitrine Tech: validar pelas docs especificas.
- Se nao houver teste automatizado aplicavel, informe a validacao manual feita.
