# Regras editoriais da pagina de conteudo

Estas regras valem para:

- `noticias.html`

A pagina de Noticias concentra somente a editoria de noticias do site.

## Palavra-chave `notícia nova`

Sempre que o pedido do usuario trouxer a palavra-chave `notícia nova` ou `noticia nova`, execute o fluxo completo da editoria Noticias:

1. Atualize o card `Notícias Tech` da pagina inicial (`index.html`) para destacar a nova materia.
2. O card da home deve usar dados reais da nova materia: titulo, chamada/resumo, imagem, categoria/contexto e link para `/noticias`.
3. Atualize `noticias.html` para que a nova materia seja o destaque principal da pagina.
4. Crie para a materia principal um design e uma estrutura especiais, livres e autorais, adequados ao assunto da noticia, podendo fugir do padrao visual recorrente do site.
5. Essa liberdade visual vale somente para a area da materia principal. Preserve header, menu, rodape, SEO, metadados, URL limpa, comentarios, formularios, slugs e seletores `data-*`.
6. Quando criar CSS ou classes para esse design especial, prefira escopar por classe da materia ou slug para evitar impacto em outras paginas e em materias arquivadas.
7. Mova a materia que era destaque principal para a area inferior `Continue no radar`.
8. A area `Continue no radar` deve usar `details.article-archive-card` dentro de `.article-archive-grid[data-archive-limit="5"]`.
9. Mantenha no maximo 5 materias antigas nessa area; se ja houver 5, remova a mais antiga antes de inserir a anterior.
10. Preserve slugs, formularios e listas de comentarios da materia que saiu do destaque, sem perder o vinculo com comentarios ja publicados.

## Quando adicionar novo conteudo

Sempre que o pedido for "adicione o novo conteudo" para a pagina de noticias, ou quando a palavra-chave `notícia nova`/`noticia nova` for usada:

1. Transforme o novo conteudo no destaque principal da pagina.
2. O destaque principal deve conter titulo, subtitulo, data em que foi adicionado, imagem e comentarios do visitante.
3. Mova o destaque principal anterior para a area de conteudos anteriores.
4. O conteudo anterior deve virar um card compacto e expansivel, com chamada curta que incentive a leitura.
5. Mantenha no maximo 5 conteudos anteriores na pagina.
6. Se ja houver 5 conteudos anteriores na pagina, exclua o mais antigo antes de adicionar outro.

## Campos obrigatorios

Todo conteudo principal ou anterior precisa manter:

- Titulo claro e especifico.
- Subtitulo com contexto e promessa de leitura.
- Data do momento em que o conteudo foi adicionado ao site.
- Imagem relevante.
- Campo de comentario do visitante vinculado ao slug unico do conteudo.

## Comentarios

Os comentarios de materias e noticias usam:

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

- Use o acabamento premium aplicado em `noticias.html` como base de qualidade, mas a palavra-chave `notícia nova` autoriza uma composição especial, livre e fora do padrão recorrente para a materia principal.
- O destaque principal deve continuar forte, com hero visual, meta de data, imagem e estrutura visual criada para o tema da noticia.
- Conteudos anteriores devem aparecer em `details.article-archive-card`, dentro de `.article-archive-grid[data-archive-limit="5"]`, com imagem, data, titulo, subtitulo e botao visual de expansao.
- Nao informe visualmente que um conteudo e secundario; use titulos editoriais como "Continue no radar" ou "Continue explorando".
- Preserve performance: imagens antigas devem usar `loading="lazy"` e `decoding="async"`.
- Mantenha slugs estaveis e descritivos para preservar comentarios ja publicados.
