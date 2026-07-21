# Encontre Aqui Tech - Guia rapido para Codex

Use estas regras para trabalhar no projeto com baixo consumo de contexto.

## Ordem de leitura

1. Leia este arquivo.
2. Leia `docs/ai-map.md`.
3. Abra apenas os 3 a 5 arquivos diretamente relacionados a tarefa.
4. Abra regras detalhadas somente quando a tarefa exigir.

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

## Regra da palavra-chave `notícia nova`

- Quando o usuario usar a palavra-chave `notícia nova` ou `noticia nova`, tratar como tarefa editorial obrigatoria da editoria Noticias.
- Atualizar o card `Notícias Tech` da pagina inicial (`index.html`) para destacar a nova materia, mantendo imagem, titulo, resumo/chamada e link coerentes com `/noticias`.
- Atualizar `noticias.html` para que a nova materia vire o destaque principal da pagina.
- A materia principal de `noticias.html` deve ter design e estrutura especiais, criados livremente para o tema da noticia, podendo fugir do padrao visual recorrente do site.
- A liberdade visual vale para a area da materia principal; preservar header, menu, rodape, SEO, comentarios, slugs, seletores `data-*`, acessibilidade, responsividade e desempenho.
- Mover a materia que era destaque principal em `noticias.html` para a area inferior `Continue no radar`, dentro de `.article-archive-grid[data-archive-limit="5"]`.
- Manter no maximo 5 materias antigas em `Continue no radar`; se passar de 5, remover a mais antiga.
- Preservar comentarios, slugs existentes, seletores `data-*`, imagens, metadados, URLs limpas e formularios de comentario conforme `docs/regras-editoriais.md`.

## Modo manutencao

- Pagina oculta: `manutencao.html`.
- Quando o usuario pedir `manutencao on` ou `manutenção on`, crie `maintenance.flag` na raiz do projeto.
- Quando o usuario pedir `manutencao off` ou `manutenção off`, remova `maintenance.flag`.
- Com `maintenance.flag` presente, o `.htaccess` entrega `manutencao.html` como resposta 503 para rotas publicas, mantendo assets liberados.

## Validacao

- HTML/CSS/JS: revisar no navegador e console quando possivel.
- PHP/API: usar `php -S localhost:8000` e testar o fluxo afetado.
- Editorias e Vitrine Tech: validar pelas docs especificas.
- Se nao houver teste automatizado aplicavel, informe a validacao manual feita.

## Salvamento obrigatorio

- Ao finalizar qualquer solicitacao que altere arquivos deste projeto, salvar a versao no Git local e no GitHub.
- Antes de salvar, revisar `git status --short` e confirmar que somente arquivos do escopo da solicitacao serao incluidos.
- Se houver alteracoes fora do escopo ou feitas pelo usuario no mesmo momento, nao misturar no commit sem confirmar.
- Usar preferencialmente `scripts/salvar-github.cmd "Mensagem objetiva do commit"` no Windows.
- O script deve criar o commit local, sincronizar com `origin` usando rebase e fazer push para o GitHub do projeto.
- Informar na resposta final a mensagem do commit, a branch e se o push foi concluido.
