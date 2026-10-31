# Encontre Aqui Tech — Guia de trabalho para o Codex

Este documento define como trabalhar no projeto `encontreaquitech.com` com segurança, consistência e baixo consumo de contexto.

## 1. Leitura inicial obrigatória

Siga esta ordem antes de alterar arquivos:

1. Leia este `AGENTS.md`.
2. Leia `docs/ai-map.md`.
3. Localize a área afetada por nome, rota, seletor, slug, função ou mensagem de erro.
4. Abra somente de três a cinco arquivos diretamente relacionados à tarefa.
5. Consulte regras detalhadas apenas quando o escopo exigir.

## 2. Uso eficiente do contexto

- Não leia o repositório inteiro.
- Prefira buscas direcionadas antes de abrir arquivos grandes.
- Faça alterações pontuais; não reescreva arquivos inteiros quando uma edição menor resolver.
- Evite refatorações, renomeações e mudanças globais sem solicitação explícita.
- Não reproduza arquivos completos na resposta final.

## 3. Arquitetura do projeto

- Front-end: HTML estático, CSS global e JavaScript vanilla.
- Back-end: PHP procedural.
- Banco de dados: MySQL/MariaDB via PDO.
- Não há framework front-end, `package.json`, npm, Composer, Tailwind, build ou lint formal.
- As URLs limpas são servidas pelo Apache por meio do `.htaccess`.

### Arquivos principais

- `index.html`: página inicial.
- `noticias.html`: editoria de notícias.
- `assets/css/styles.css`: estilos globais.
- `assets/js/main.js`: comportamentos gerais e editoriais.
- `assets/js/auth.js`: autenticação no front-end.
- `api/`: endpoints PHP.
- `app/`: serviços e helpers compartilhados.

## 4. Regras de segurança e preservação

- Nunca leia, exiba ou altere secrets em `.env`, `.env.*` ou `private/`.
- Preserve URLs limpas, slugs, comentários, formulários, login e seletores `data-*`.
- Não altere `.htaccess`, `_headers`, configurações de banco ou migrations sem necessidade clara.
- Mantenha prepared statements, proteção CSRF, rate limits e honeypots nos fluxos PHP.
- Não exponha e-mail, IP, user-agent, hash de senha, token ou credenciais em respostas públicas.
- Respeite mudanças existentes do usuário e não misture alterações fora do escopo no commit.

## 5. Regras específicas por área

### Conteúdo editorial

Leia `docs/regras-editoriais.md` antes de alterar `noticias.html` ou qualquer conteúdo editorial que venha a ser criado ou reativado.

### Cadastro, login e usuários

Leia `docs/cadastro-usuarios.md` somente quando a tarefa envolver autenticação, sessão, cadastro, recuperação de senha ou dados de usuários.

## 6. Palavra-chave `notícia nova`

Quando o usuário escrever `notícia nova` ou `noticia nova`, trate a solicitação como uma tarefa editorial obrigatória da editoria Notícias.

### Página inicial

- Atualize a área `Notícias Tech` em `index.html`.
- Mantenha dois cards: a notícia mais recente à esquerda e a anterior à direita.
- Preserve imagens, títulos, resumos, links e `data-home-news-date` coerentes com `/noticias`.

### Página de notícias

- Transforme a nova matéria no destaque principal de `noticias.html`.
- Crie para a matéria principal uma estrutura visual especial e adequada ao tema.
- Preserve header, menu, rodapé, SEO, comentários, slugs, seletores `data-*`, acessibilidade, responsividade e desempenho.
- Mova o destaque anterior para `Continue no radar`, dentro de `.article-archive-grid[data-archive-limit="5"]`.
- Mantenha no máximo cinco matérias no arquivo; ao exceder o limite, remova a mais antiga.
- Preserve comentários, slugs, imagens, metadados, URLs limpas e formulários conforme `docs/regras-editoriais.md`.

## 7. Modo de manutenção

- Página exibida: `manutencao.html`.
- Para `manutencao on` ou `manutenção on`, crie `maintenance.flag` na raiz.
- Para `manutencao off` ou `manutenção off`, remova `maintenance.flag`.
- Com a flag presente, o `.htaccess` deve responder com `manutencao.html` e status HTTP 503 nas rotas públicas, mantendo os assets liberados.

## 8. Validação

Escolha a validação adequada ao tipo de alteração:

- HTML, CSS e JavaScript: revise no navegador e verifique o console quando possível.
- Links e rotas: confirme o destino e o comportamento da URL limpa.
- PHP e API: execute `php -S localhost:8000` e teste o fluxo afetado.
- Conteúdo editorial: valide destaque, arquivo, slug, imagem, data e limite de matérias.
- Sem teste automatizado aplicável, descreva a validação manual realizada e qualquer risco residual.

## 9. Salvamento obrigatório no Git

Toda solicitação que altere arquivos deve ser salva no Git local e enviada ao GitHub.

1. Revise `git status --short`.
2. Confirme que somente arquivos do escopo serão incluídos.
3. Não inclua alterações externas ou simultâneas do usuário sem confirmação.
4. No Windows, use preferencialmente:

   ```cmd
   scripts\salvar-github.cmd "Mensagem objetiva do commit"
   ```

5. O script deve criar o commit, sincronizar com `origin` usando rebase e realizar o push.
6. Na resposta final, informe a mensagem do commit, a branch e o resultado do push.

## 10. Entrega final

Informe de forma objetiva:

- quais arquivos foram alterados ou removidos;
- por que cada grupo de mudanças foi necessário;
- quais validações foram executadas;
- quais validações não puderam ser executadas;
- qual risco residual permanece, se houver;
- a mensagem do commit, a branch e o status do push.
