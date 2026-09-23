# VoluntarIA — Fechamento da Primeira Entrega

Estado conferido agora: a verificação de tipagem já passa sem erros, e as páginas de editar perfil e editar organização foram criadas e estão registradas nas rotas. Falta o acabamento, os testes no navegador e o relatório.

## O que será feito

**1. Acabamento do site**
- Ligar os avisos de sucesso e erro (as mensagens que aparecem ao salvar ou errar a senha) na raiz do site — hoje elas são disparadas pelas telas, mas não têm onde aparecer.
- Corrigir o título e a descrição gerais do site, que ainda estão com o texto padrão em inglês, para o nome e a descrição da VoluntarIA.
- Rodapé: os dois convites ("Quero ser voluntário" e "Sou uma organização") devem abrir a criação de conta já com o tipo certo escolhido.

**2. Compilação**
- Rodar a verificação de tipos e a compilação de produção e corrigir o que aparecer, até passar limpo.

**3. Testes no navegador**
- Navegar por todas as páginas públicas: Início, Oportunidades, Organizações, Quem nós somos, Impacto, Como funciona.
- Criar uma conta de voluntário e conferir que ela cai no painel do voluntário.
- Editar o perfil do voluntário e conferir que os dados voltam salvos.
- Criar uma conta de organização, cadastrar os dados institucionais e conferir o painel da organização.
- Sair da conta e conferir que o cabeçalho volta ao estado de visitante.
- Entrar de novo com a mesma conta.
- Confirmar que quem não está conectado é mandado para a tela de acesso ao tentar abrir painel, editar perfil ou editar organização.
- Conferir que a galeria de visitas funciona (setas, miniaturas e foto ampliada).

**4. Relatório técnico da Primeira Entrega (TCC)**
Documento em português com: o que foi criado; a tecnologia escolhida e o porquê; como os dados são armazenados e protegidos; como testar passo a passo; quais partes são demonstração; e qual é a próxima etapa.

## Detalhes técnicos

- Montar `<Toaster />` (sonner) uma vez em `src/routes/__root.tsx` e atualizar o `head()` da raiz.
- Ajustar `search={{ modo: "cadastro", tipo: "voluntario" | "organizacao" }}` nos links do `SiteFooter`.
- Verificação: `bunx tsgo --noEmit` e build de produção; testes com Playwright em `http://localhost:8080`, com contas de teste criadas pela própria interface.
- Relatório salvo como arquivo de documento entregue no chat.

## Fora desta etapa

Oportunidades, candidaturas, mensagens, notificações, doações, agenda, horas, avaliações, certificados e IA.
