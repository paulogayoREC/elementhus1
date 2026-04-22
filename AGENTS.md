# Regras editoriais do Encontre Aqui Tech

Ao receber um pedido como "adicione o novo conteudo" para uma destas paginas:

- `noticias.html`
- `novidades-tecnologicas.html`
- `curiosidades.html`
- `alertas-seguranca.html`
- `tutoriais.html`

siga as regras completas em `docs/regras-editoriais.md`.

Resumo obrigatorio:

- O novo conteudo sempre vira o destaque principal da pagina.
- O destaque principal precisa ter titulo, subtitulo, data de adicao, imagem e formulario de comentario.
- O conteudo principal anterior deve descer para a area compacta de leitura expansivel.
- A area compacta deve manter no maximo 5 conteudos anteriores; ao passar de 5, remova o mais antigo.
- Conteudos anteriores tambem precisam manter titulo, subtitulo, data, imagem e formulario de comentario.
- Nao use rotulo visual classificando o conteudo como secundario.
- Mantenha o acabamento visual premium ja aplicado em `noticias.html`.

## Regra da Vitrine Tech

Siga tambem `docs/regras-vitrine-tech.md` ao alterar produtos, categorias ou a sessao "Vitrine Tech" da pagina inicial.

Resumo obrigatorio:

- A pagina inicial deve exibir 5 produtos na sessao Vitrine Tech.
- Os 5 produtos devem ser substituidos todos os dias a partir de 00:00 no fuso `America/Recife`.
- A selecao deve vir de produtos publicados nas paginas `indicacoes/*.html`.
- A selecao do dia nao pode repetir produtos entre si nem repetir os produtos exibidos no dia anterior.
- Ao criar nova categoria de indicacoes, inclua a pagina em `assets/js/tech-showcase.js`.
