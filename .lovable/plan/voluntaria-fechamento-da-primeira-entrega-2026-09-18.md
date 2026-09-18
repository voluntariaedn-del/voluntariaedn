# VoluntarIA — Fechamento da Primeira Entrega

Continuação do ponto exato onde parou. Nada do que já existe (Início, Como funciona, Oportunidades, Organizações, Impacto, Entrar/Criar conta, proteção de páginas) será refeito.

## O que será criado

**1. Quem nós somos (`/quem-somos`)**
- Texto sobre o propósito do projeto e como a plataforma funciona.
- Equipe: foto, nome e função, vindos do banco; itens de demonstração aparecem marcados como tal.
- Galeria de visitas às ONGs: carrossel com setas, arraste no celular, navegação por teclado e miniaturas; legenda com ONG, cidade e data; clique abre a foto ampliada em tela cheia com avanço entre fotos.

**2. Painel do voluntário (`/painel/voluntario`)**
- Resumo do perfil (foto, nome, cidade, descrição), interesses, habilidades, disponibilidade, horas por semana e modalidade.
- Atalhos para candidaturas, agenda, mensagens, horas e avaliações — visíveis e marcados como "em breve", sem dados inventados.
- Botão para editar perfil.

**3. Painel da organização (`/painel/organizacao`)**
- Resumo institucional (logo, nome, cidade, áreas de atuação), estado da verificação.
- Aviso e atalho para completar o cadastro quando a organização ainda não existe.
- Atalhos para oportunidades, candidaturas e voluntários, marcados como "em breve".

**4. Painel do administrador (`/painel/admin`)**
- Lista de pessoas cadastradas e de organizações, com o botão de verificar organização.
- Acesso negado com mensagem clara para quem não é administrador.

**5. Entrada única de painel (`/painel`)**
- Encaminha cada pessoa ao painel do seu tipo; quem não estiver conectado vai para a página de acesso.

**6. Editar perfil do voluntário (`/perfil/editar`)**
- Nome, foto (endereço de imagem), cidade, estado, telefone, descrição, interesses, habilidades, disponibilidade, horas por semana e modalidade.

**7. Editar organização (`/organizacao/editar`)**
- Nome, logo, descrição, missão, cidade, estado, contato, site, redes sociais e áreas de atuação. Cria o registro quando ainda não existe. O selo de verificada não é editável pela própria organização.

**8. Ajustes finais de cabeçalho e rodapé**
- Links de acesso com o tipo de conta correto ("Quero ser voluntário" / "Sou uma organização"), links de painel e de edição coerentes com o estado de quem está conectado.

**9. Compilação e testes**
- Corrigir todos os erros de tipagem e de compilação até o projeto compilar limpo.
- Testar no navegador: navegação por todas as páginas, criar conta de voluntário, criar conta de organização, entrar, editar perfis, abrir cada painel e confirmar que páginas internas redirecionam quem não está conectado.

**10. Relatório técnico da Primeira Entrega**
- Documento com o que foi criado, tecnologia escolhida, como os dados são armazenados, como testar, o que é demonstração e qual é a próxima etapa — para o arquivo do TCC.

Não entram nesta etapa: oportunidades reais, candidaturas, mensagens, notificações, doações, agenda, horas, avaliações, certificados e IA.

## Detalhes técnicos

- Novas rotas: `quem-somos.tsx`, `painel.index.tsx`, `painel.voluntario.tsx`, `painel.organizacao.tsx`, `painel.admin.tsx`, `perfil.editar.tsx`, `organizacao.editar.tsx`.
- Sessão e papéis pelos hooks existentes em `src/lib/auth.tsx`; leituras e escritas pelo cliente Supabase com RLS aplicada como o usuário; `RequireAuth` já existente envolve as páginas internas.
- Verificação de organização feita pelo administrador via atualização em `organizations.verified`, com a trigger do banco impedindo autoverificação.
- Formulários com react-hook-form + zod; avisos com sonner.
- Carrossel escrito à mão (sem nova dependência), com toque, teclado e miniaturas.
- Fotos por endereço de imagem, já que o armazenamento público de arquivos está bloqueado neste ambiente.
- `head()` próprio em cada nova rota (título, descrição e metadados de compartilhamento).
- Verificação: `tsgo` para tipagem, build de produção e Playwright para os testes de navegação e acesso.
