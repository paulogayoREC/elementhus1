# Regras editoriais das paginas de conteudo

Estas regras valem para:

- `noticias.html`
- `novidades-tecnologicas.html`
- `curiosidades.html`
- `alertas-seguranca.html`
- `tutoriais.html`

## Quando adicionar novo conteudo

Sempre que o pedido for "adicione o novo conteudo" para uma dessas paginas:

1. Transforme o novo conteudo no destaque principal da pagina.
2. O destaque principal deve conter titulo, subtitulo, data em que foi adicionado, imagem e comentarios do visitante.
3. Mova o destaque principal anterior para a area de conteudos anteriores.
4. O conteudo anterior deve virar um card compacto e expansivel, com chamada curta que incentive a leitura.
5. Mantenha no maximo 5 conteudos anteriores por pagina.
6. Se ja houver 5 conteudos anteriores, exclua o mais antigo antes de adicionar outro.

## Campos obrigatorios

Todo conteudo principal ou anterior precisa manter:

- Titulo claro e especifico.
- Subtitulo com contexto e promessa de leitura.
- Data do momento em que o conteudo foi adicionado ao site.
- Imagem relevante.
- Campo de comentario do visitante vinculado ao slug unico do conteudo.

## Comentarios

Os comentarios de materias, novidades, curiosidades, alertas e tutoriais usam:

- API: `api/article-comments.php`
- Tabela MySQL: `article_comments`
- Criacao defensiva da tabela: `app/ArticleCommentStorage.php`
- Migracao: `database/migrations/20260422_create_article_comments_table.sql`

Cada formulario precisa ter:

- `data-article-comment-form`
- `data-content-slug`
- `data-content-title`
- Um `textarea` com `data-article-comment-message`
- Um contador com `data-article-comment-count`
- Uma area de status com `data-article-comment-status` e o mesmo `data-content-slug`
- Uma lista com `data-article-comment-list` e o mesmo `data-content-slug`

## Direcao visual

- Use o acabamento premium aplicado em `noticias.html`.
- O destaque principal deve continuar forte, com hero visual, meta de data e imagem.
- Conteudos anteriores devem aparecer em `details.article-archive-card`, dentro de `.article-archive-grid[data-archive-limit="5"]`, com imagem, data, titulo, subtitulo e botao visual de expansao.
- Nao informe visualmente que um conteudo e secundario; use titulos editoriais como "Continue no radar", "Continue explorando", "Mais alertas" ou "Outros guias uteis".
- Preserve performance: imagens antigas devem usar `loading="lazy"` e `decoding="async"`.
- Mantenha slugs estaveis e descritivos para preservar comentarios ja publicados.
