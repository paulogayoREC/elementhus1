# Automacao de produtos no Telegram

Use o script `scripts/postar-produtos-telegram.py` para publicar automaticamente no grupo **Encontre Aqui Tech** os produtos novos adicionados em qualquer pagina `indicacoes/*.html`.

## O que voce precisa

- Token do bot `encontreaquitech_bot`, gerado no BotFather.
- ID do grupo do Telegram. O nome do grupo nao basta; o valor costuma ser algo como `-1001234567890`.
- Bot adicionado ao grupo como administrador, com permissao para enviar mensagens e midias.
- Secrets no GitHub:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`

Para descobrir o `TELEGRAM_CHAT_ID`, envie uma mensagem qualquer no grupo e acesse:

```text
https://api.telegram.org/botSEU_TOKEN/getUpdates
```

Procure o campo `chat.id` do grupo. Se o grupo for publico e tiver username, tambem e possivel usar `@username`, mas o ID numerico e mais estavel.

## Primeira configuracao

Antes de ativar a publicacao automatica, marque os produtos atuais como ja publicados. Isso evita que o grupo receba todos os produtos antigos de uma vez:

```sh
python scripts/postar-produtos-telegram.py --mark-existing
```

Depois, salve o arquivo `.github/telegram-products-state.json` no GitHub.

## Teste local sem enviar

```sh
python scripts/postar-produtos-telegram.py --dry-run
```

Para testar com credenciais locais, crie `private/telegram.env` no seu computador:

```sh
TELEGRAM_BOT_TOKEN=123456:token-do-bot
TELEGRAM_CHAT_ID=-1001234567890
EAT_SITE_URL=https://encontreaquitech.com
```

A pasta `private/` ja esta no `.gitignore`, entao esse arquivo nao deve ir para o repositorio.

## Como enriquecer a mensagem

Hoje os cards das paginas de indicacoes possuem titulo, imagem e link. Se quiser incluir descricao curta e preco na postagem, adicione atributos opcionais no `<article>` do produto:

```html
<article
  class="product-card affiliate-product-card"
  data-telegram-subtitle="Ideal para setup gamer e produtividade."
  data-telegram-price="R$ 299,90"
>
```

Se o preco nao for informado, a mensagem usa `Confira o preço atualizado na Amazon`. Para buscar preco real de forma automatica, o caminho correto e usar a Amazon Product Advertising API, com credenciais proprias e observando as regras de exibicao de precos da Amazon.

## Formato da mensagem

```text
🔥 Oferta Tech

Nome do produto
Descricao curta ou categoria.

💰 Preço informado ou chamada para conferir na Amazon

👉 Ver na Amazon:
https://amzn.to/link
```
