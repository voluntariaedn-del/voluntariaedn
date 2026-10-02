# VoluntarIA — Recuperação de senha

Objetivo: permitir que quem esqueceu a senha receba um e-mail e defina uma nova senha, tudo em português e dentro do fluxo de acesso já existente.

## O que será feito

**1. Link "Esqueci minha senha" na tela de acesso (`/auth`)**
- Abaixo do campo de senha, na aba "Entrar", um link discreto "Esqueci minha senha".
- Ao clicar, o formulário muda para o modo "Recuperar senha": só o campo de e-mail e o botão "Enviar link de recuperação".
- Após o envio, aviso claro: "Se o e-mail estiver cadastrado, você receberá o link em instantes" (sem revelar se o e-mail existe).
- Botão para voltar à tela de entrada.

**2. Página de nova senha (`/reset-password`)**
- Página pública para onde o link do e-mail leva a pessoa.
- Detecta o link de recuperação na URL; se o link estiver inválido ou expirado, mostra aviso e botão para pedir um novo.
- Formulário com "Nova senha" e "Confirmar nova senha" (mínimo 6 caracteres, as duas iguais).
- Ao salvar, a senha é trocada e a pessoa é levada ao painel já conectada.
- Título e descrição próprios da página (noindex, como as demais telas de conta).

**3. Ajustes finais**
- Mensagens de erro em português (link expirado, senha fraca, muitas tentativas).
- Verificação de tipos e compilação de produção até passar sem erros.
- Teste no navegador: abrir a tela de acesso, pedir recuperação e conferir a página de nova senha.

## Detalhes técnicos

- `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + "/reset-password" })` na tela `/auth`.
- Nova rota `src/routes/reset-password.tsx`: lê `type=recovery` do hash da URL e chama `supabase.auth.updateUser({ password })` (sem senha atual — sessão de recuperação é isenta).
- Nenhuma mudança no banco de dados; usa a autenticação já existente.

## O que fica para depois

Personalização visual do e-mail de recuperação (requer domínio de e-mail próprio configurado).
