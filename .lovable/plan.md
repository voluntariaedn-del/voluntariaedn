# VoluntarIA — Fechamento da Primeira Entrega (enxuto)

Estado conferido agora: a verificação de tipagem já passa sem erros e as telas de editar perfil e editar organização já existem e estão registradas. Falta acabamento, build, testes e relatório. Plano organizado para caber em poucas rodadas de trabalho.

## O que será feito

**1. Acabamento (uma rodada)**
- Ligar na raiz do site o aviso de sucesso/erro que as telas já disparam ao salvar ou errar a senha (hoje não tem onde aparecer).
- Trocar o título e a descrição gerais do site, ainda no texto padrão em inglês, pelos da VoluntarIA.
- Rodapé: "Quero ser voluntário" e "Sou uma organização" abrindo a criação de conta já com o tipo certo marcado.

**2. Build (mesma rodada)**
- Rodar a verificação de tipos e a compilação de produção; corrigir o que aparecer até passar limpo.

**3. Testes no navegador (uma rodada, roteiro único)**
Em um único percurso automatizado: abrir as páginas públicas (Início, Oportunidades, Organizações, Quem nós somos, Impacto, Como funciona); criar conta de voluntário; editar o perfil e conferir que os dados voltam salvos; sair; entrar de novo; criar conta de organização e cadastrar os dados institucionais; conferir os painéis; e confirmar que, deslogado, o painel e as telas de edição levam para a tela de acesso.

**4. Relatório técnico do TCC (uma rodada)**
Documento em português com: o que foi criado; a tecnologia escolhida e o porquê; como os dados são armazenados e protegidos; como testar passo a passo; o que é demonstração; e a próxima etapa. Entregue como arquivo para download.

## Detalhes técnicos

- `<Toaster />` (sonner) montado uma vez em `src/routes/__root.tsx`; `head()` da raiz atualizado.
- `search={{ modo: "cadastro", tipo: "voluntario" | "organizacao" }}` nos links do `SiteFooter`.
- Verificação com `bunx tsgo --noEmit` e build de produção; testes com Playwright em `http://localhost:8080` num único script.
- Relatório em `/mnt/documents`.

## Fora desta etapa

Oportunidades, candidaturas, mensagens, notificações, doações, agenda, horas, avaliações, certificados e IA.
