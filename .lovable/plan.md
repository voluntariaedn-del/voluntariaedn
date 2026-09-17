# VoluntarIA — Primeira Entrega (Base da Plataforma)

Nova plataforma que conecta pessoas que querem ajudar a ONGs, projetos sociais e comunidades. Esta primeira etapa cria a fundação: identidade visual própria, páginas públicas, contas de usuário, perfis e painéis iniciais.

## O que será entregue agora

**Páginas públicas**
- Início: o que é a VoluntarIA, chamadas "Quero ser voluntário", "Sou uma organização" e "Encontrar oportunidades", categorias de causas, como funciona, prévia de impacto (marcada como demonstração), depoimentos e chamada final de cadastro.
- Como funciona: o fluxo completo, do cadastro à avaliação.
- Organizações: lista pública com selo de verificada.
- Perfil público de organização e perfil público de voluntário.
- Impacto: números da plataforma, com aviso claro de "dados demonstrativos" enquanto não houver volume real.

**Contas e acesso**
- Cadastro e entrada por e-mail e senha, e também com conta Google.
- Na criação da conta a pessoa escolhe: voluntário ou organização.
- Administrador é concedido internamente, nunca escolhido pelo próprio usuário.
- Verificação de organização só pode ser concedida por administrador.

**Perfis**
- Voluntário: nome, foto, cidade/estado, contato, descrição, interesses, habilidades, disponibilidade, horas por semana, modalidade e experiências.
- Organização: nome, logo, descrição, cidade/estado, contato, site, redes sociais, áreas de atuação e dados institucionais.
- Telas de edição para cada um, com validação de formulário.

**Painéis iniciais**
- Voluntário: resumo do perfil, disponibilidade, atalhos para candidaturas, agenda, mensagens e horas (seções ainda vazias, preparadas para as próximas etapas).
- Organização: resumo institucional, estado da verificação, atalhos para oportunidades, candidaturas e voluntários.
- Administrador: lista de usuários e organizações, com ação de verificar organização.

**Navegação**
- Cabeçalho que muda conforme a pessoa está conectada ou não, menu próprio para celular, e rodapé.
- Funciona bem em celular, tablet, notebook e computador.

## Identidade visual

Direção acolhedora e confiável, evitando o visual corporativo frio e o infantil: verde-esmeralda como cor principal (solidariedade e crescimento), âmbar quente como destaque para urgência, fundos claros em tom levemente quente, cantos arredondados generosos e tipografia humanista. Antes de construir, apresento três direções visuais para você escolher.

## Escolhas técnicas

- **Frontend:** React com TanStack Start (rotas por arquivo, renderização no servidor para SEO) e Tailwind CSS v4 com tokens semânticos.
- **Backend e dados:** Lovable Cloud (PostgreSQL gerenciado, autenticação, armazenamento de arquivos e funções de servidor). Persistência real desde o início — nada de dados fictícios no lugar de banco, nada de localStorage para dados importantes.
- **Armazenamento de arquivos:** buckets para fotos de voluntários e logos de organizações.
- **Lógica de negócio:** fora das páginas, em funções de servidor por domínio (`profiles`, `organizations`, `admin`), com as páginas apenas consumindo.

### Estrutura inicial do banco

- `profiles` — um registro por conta: nome, foto, cidade, estado, telefone, descrição (criado automaticamente no cadastro).
- `user_roles` — tabela separada de papéis (`volunteer`, `organization`, `admin`), com função de verificação no banco. Papéis nunca ficam na tabela de perfil.
- `volunteer_profiles` — interesses, habilidades, disponibilidade, horas semanais, modalidade, experiências.
- `organizations` — dados institucionais, áreas de atuação, contatos, `verified` (somente administrador altera).
- `causes` — catálogo de causas/categorias, usado em toda a plataforma.

Tabelas de oportunidades, candidaturas, mensagens, horas, avaliações, necessidades e doações entram nas etapas seguintes, mas o modelo já é desenhado prevendo-as.

### Segurança

- Regras de acesso por linha em todas as tabelas: cada pessoa lê e edita apenas o que é seu; perfis públicos expõem somente campos seguros.
- Permissões de escrita por papel; `verified` e papéis só por administrador.
- Nenhuma chave secreta no navegador; toda operação privilegiada roda no servidor após conferir quem está pedindo.

## Próximas etapas (depois desta entrega)

2. Oportunidades: criação, publicação, listagem e busca com filtros.
3. Candidaturas e conexão organização ↔ voluntário.
4. Mensagens e agenda.
5. Horas, avaliações e certificados com código de validação.
6. Necessidades urgentes e doações de recursos.
7. IA Match e assistente, usando apenas oportunidades reais do banco.
8. Painel administrativo completo (denúncias, moderação, indicadores).
9. Publicação.

A IA só entra depois que usuários e oportunidades estiverem funcionando, como você pediu.
