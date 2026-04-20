# Segurança do Encontre Aqui Tech

## Decisoes aplicadas

- O painel administrativo nao deve existir como HTML publico em sites estaticos.
- O frontend coleta senhas apenas nos formularios de login, cadastro e redefinicao, sempre enviando para endpoints PHP com CSRF.
- A pagina principal exibe cadastro publico somente com validacao no servidor, hash de senha e banco MySQL.
- Arquivos privados, variaveis de ambiente e paginas administrativas locais ficam ignorados pelo Git.
- Cabecalhos de seguranca foram definidos em `_headers` para plataformas que suportam esse arquivo.

## Requisitos para cadastro e admin profissionais

Para login Google e painel administrativo, use um provedor com validacao no servidor:

- Supabase Auth + Row Level Security
- Firebase Authentication + Firestore Security Rules
- Auth0/Clerk + backend proprio

O acesso administrativo deve ser validado no servidor com:

- allowlist do e-mail `paulogayo@proton.me`
- MFA habilitado
- sessoes seguras e expiracao
- regras de banco que bloqueiem leitura por usuarios comuns
- logs de acesso e auditoria

## O que nao deve ser feito

- Nao publicar `admin.html` em GitHub Pages.
- Nao colocar senha, hash de senha ou token secreto em JavaScript publico.
- Nao usar `localStorage` como banco de usuarios.
- Nao implementar login Google sem OAuth Client ID oficial e verificacao de token no servidor.
- Nao revelar se um e-mail existe em mensagens de login ou recuperacao de senha.
- Nao salvar token de redefinicao de senha em texto puro no banco.
- Nao salvar comentarios apenas no navegador quando eles precisam aparecer para todo o publico.
- Nao expor IP, user-agent ou dados internos dos comentarios na API publica.
