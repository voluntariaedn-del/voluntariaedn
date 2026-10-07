# Trocar o ícone do topo pela logo da VoluntarIA

## O que muda
- No topo do site, o quadradinho azul com o ícone de coração e aperto de mãos será substituído pelo **símbolo da nova logo** (o coração com as pessoas e o circuito dourado).
- O texto "VoluntarIA" ao lado continua, para manter a leitura em tamanho pequeno.
- O **ícone da aba do navegador** também passa a ser o símbolo da nova logo.
- O rodapé, se usar o mesmo ícone antigo, recebe a mesma troca.

## Detalhes técnicos
- Recortar a imagem enviada para ficar só com o símbolo (sem o fundo cinza de papel e sem o texto), com fundo transparente, e salvar como imagem do site.
- Em SiteHeader (e SiteFooter, se aplicável), trocar o span com HeartHandshake por um `<img>` de ~40px com texto alternativo "VoluntarIA".
- Gerar `public/favicon.png` (64x64, quadrado) a partir do símbolo, apontar o `<link rel="icon">` em `__root.tsx` para ele e remover o favicon antigo.
