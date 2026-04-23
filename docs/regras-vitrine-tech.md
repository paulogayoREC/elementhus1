# Regra da Vitrine Tech

Esta regra vale para a sessao "Vitrine Tech" da pagina inicial (`index.html`).

## Rotacao a cada 4 horas

1. A vitrine deve exibir exatamente 5 produtos por janela de destaque.
2. A troca acontece a cada 4 horas no fuso `America/Recife`: 00:00, 04:00, 08:00, 12:00, 16:00 e 20:00.
3. Os produtos devem ser escolhidos entre itens publicados nas paginas `indicacoes/*.html`.
4. A selecao deve ser pseudoaleatoria, mas deterministica por janela de 4 horas, para que todos os visitantes vejam a mesma vitrine naquele periodo.
5. A selecao da janela nao pode repetir produtos dentro dos 5 cards.
6. Sempre que houver catalogo suficiente, uma janela do mesmo dia deve usar produtos diferentes dos ja destacados nas janelas anteriores daquele dia.
7. A selecao de qualquer janela nao pode repetir produtos exibidos no dia anterior.

## Manutencao

- A regra esta implementada em `assets/js/tech-showcase.js`.
- O painel da pagina inicial usa `data-tech-picks-panel` como ponto de renderizacao.
- O HTML estatico em `index.html` deve continuar existindo como fallback visual caso o JavaScript nao carregue.
- Ao adicionar produtos em uma categoria existente, o script passa a ler os novos cards publicados nessa pagina.
- Ao criar uma nova categoria de indicacoes, inclua a nova pagina no array `sourcePages` em `assets/js/tech-showcase.js`.
- Preserve os seletores `.affiliate-product-card`, `.product-media img`, `.product-info h4` e `.product-buy-link`, pois eles alimentam a vitrine automatica.
