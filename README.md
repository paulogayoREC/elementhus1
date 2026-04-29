# elementhus1

## Atualizacao automatica das editorias

Os conteudos da secao **Editorias** ficam em `assets/js/editorial-data.js`.

As regras para adicionar novos conteudos nas paginas editoriais ficam em `docs/regras-editoriais.md`.

Para atualizar manualmente no seu computador:

```sh
python scripts/update-editorias.py
```

No GitHub, o workflow **Atualizar editorias** roda automaticamente a cada 2 dias. Ele tambem pode ser acionado como botao em **Actions > Atualizar editorias > Run workflow**.

O script tenta ler feeds RSS das fontes cadastradas e escolhe dois conteudos recentes para cada editoria. Se algum feed falhar ou nao houver itens suficientes dos ultimos 7 dias, ele mantem uma curadoria de seguranca para nao deixar o site vazio.

## Publicacao automatica de produtos no Telegram

Produtos novos adicionados em `indicacoes/*.html` podem ser publicados automaticamente no grupo do Telegram pelo script `scripts/postar-produtos-telegram.py`.

Veja a configuracao completa em `docs/telegram-produtos.md`.
