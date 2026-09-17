# VoluntarIA — Fechamento da Primeira Entrega

Objetivo: completar as páginas que faltam, fazer o site compilar e deixar cadastro, entrada e painéis funcionando de verdade com os dados do banco que já existe.

## O que será feito

**1. Entrar e criar conta (`/auth`)**
- Uma única página com duas abas: "Entrar" e "Criar conta", já abrindo na aba certa conforme o botão clicado no site.
- Criar conta por e-mail e senha, com escolha entre "Sou voluntário" e "Sou uma organização" (a escolha vem pré-selecionada quando a pessoa clica nas chamadas da página inicial).
- Entrada com conta Google (já habilitada no backend).
- Mensagens de erro em português (e-mail já cadastrado, senha curta, dados inválidos).
- Depois de entrar, a pessoa vai para o painel dela.
- Administrador nunca aparece como opção de cadastro.

**2. Quem nós somos (`/quem-somos`)**
- Texto sobre o propósito do projeto e como a plataforma funciona.
- Equipe: foto, nome e função, vindos do banco.
- Galeria de visitas às ONGs: carrossel com setas, arraste no celular, navegação por teclado e miniaturas abaixo; legenda com ONG, cidade e data; clique abre a foto ampliada em tela cheia com avanço entre fotos.
- As fotos e a equipe atualmente no banco são de demonstração e aparecem marcadas como tal.

**3. Impacto (`/impacto`)**
- Números reais contados no banco (voluntários, organizações, oportunidades, ações, horas).
- Enquanto os números forem zero ou muito baixos, aviso claro de que a plataforma está começando — sem números inventados.

**4. Painéis (`/painel`)**
- Uma entrada única que leva cada pessoa ao painel do seu tipo.
- Voluntário: resumo do perfil, disponibilidade, e atalhos para candidaturas, agenda, mensagens e horas (seções ainda vazias, preparadas para as próximas etapas).
- Organização: resumo institucional, estado da verificação e atalhos para oportunidades, candidaturas e voluntários.
- Administrador: lista de pessoas e organizações, com o botão de verificar organização.
- Quem não estiver conectado é levado para a página de acesso.

**5. Edição de perfil**
- Voluntário: nome, foto (endereço de imagem), cidade, estado, telefone, descrição, interesses, habilidades, disponibilidade, horas por semana e modalidade.
- Organização: nome, logo, descrição, cidade, estado, contato, site, redes sociais e áreas de atuação. O selo de verificada não é editável pela própria organização.

**6. Ajustes finais**
- Títulos e descrições próprios de cada página, para busca e compartilhamento.
- Conferir que o site compila e testar no navegador: criar uma conta de voluntário, uma de organização, editar perfis e abrir cada painel.

## Detalhes técnicos

- Novas rotas: `auth.tsx`, `quem-somos.tsx`, `impacto.tsx`, `painel.index.tsx`, `painel.voluntario.tsx`, `painel.organizacao.tsx`, `painel.admin.tsx`, `perfil.editar.tsx`, `organizacao.editar.tsx`.
- Sessão e papéis pelos hooks já existentes em `src/lib/auth.tsx`; leituras e escritas via cliente Supabase com RLS aplicada como o usuário.
- Verificação de organização feita por função de servidor com checagem de papel `admin` antes de escrever; a trigger no banco já bloqueia autoverificação.
- Formulários com react-hook-form + zod; avisos com sonner (`<Toaster />` montado na raiz).
- Carrossel escrito à mão (sem nova dependência), com suporte a toque, teclado e miniaturas.
- Fotos por endereço de imagem, já que o armazenamento público de arquivos está bloqueado neste ambiente.

## O que fica para depois

Oportunidades reais, candidaturas, mensagens, agenda, horas, avaliações, certificados, necessidades urgentes, doações, IA Match e assistente, e o painel administrativo completo.
