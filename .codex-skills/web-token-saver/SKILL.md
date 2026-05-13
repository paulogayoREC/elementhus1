---
name: web-token-saver
description: economizar contexto em tarefas web; use para leitura seletiva, edição pontual, debug e revisão sem abrir o repo inteiro.
---

# Web Token Saver

## Objetivo

Reduzir consumo de tokens e contexto durante tarefas de programação em projetos web.

## Regras obrigatórias

- Não ler o projeto inteiro.
- Não abrir muitos arquivos de uma vez.
- Começar por no máximo 3 a 5 arquivos relevantes.
- Usar busca por nomes, imports, rotas e mensagens de erro antes de abrir arquivos grandes.
- Não reescrever arquivos inteiros quando uma edição pontual resolve.
- Não refatorar sem pedido explícito.
- Não repetir longos trechos de código na resposta final.
- Resumir descobertas em vez de colar arquivos completos.

## Fluxo econômico

1. Identificar o tipo de tarefa.
2. Localizar arquivos candidatos por nome, rota, componente ou erro.
3. Ler apenas os trechos necessários.
4. Fazer alteração mínima.
5. Validar.
6. Responder de forma objetiva.

## Resposta final esperada

Sempre informar:

- arquivos analisados;
- arquivos modificados;
- motivo da mudança;
- comandos executados;
- se algo ficou pendente.
