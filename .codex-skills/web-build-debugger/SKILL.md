---
name: web-build-debugger
description: guia universal para corrigir erros de build, lint, typescript, dependências, imports, deploy e execução em projetos web. use quando a tarefa envolver npm run build, npm run dev, lint, typecheck, erro de compilação, erro de deploy, vite, next, react, node, dependências quebradas ou rotas com erro.
---

# Web Build Debugger

## Objetivo

Corrigir erros técnicos de build e execução com o menor impacto possível.

## Regras

- Começar pela mensagem de erro.
- Identificar arquivo, linha, pacote ou comando relacionado.
- Não alterar arquivos não relacionados.
- Não atualizar dependências sem necessidade.
- Não trocar framework, estrutura ou arquitetura para resolver erro simples.
- Validar a correção com o comando apropriado.

## Fluxo

1. Ler o erro completo.
2. Identificar causa provável.
3. Abrir apenas arquivos relacionados.
4. Corrigir a menor parte possível.
5. Rodar novamente o comando que falhou.
6. Explicar causa e solução.

## Prioridade de diagnóstico

1. Erro de sintaxe.
2. Import inexistente.
3. Tipo TypeScript.
4. Dependência ausente.
5. Configuração incorreta.
6. Incompatibilidade de versão.
7. Problema de ambiente.
