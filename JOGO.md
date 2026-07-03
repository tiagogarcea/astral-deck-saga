# Arcanum — Card Game de Batalha (sobre o projeto astral-deck-saga)

Jogo completo implementado sobre o projeto base do Lovable, mantendo o design system
(bordas douradas ornamentadas, glow místico, fonte Cinzel) e as telas Splash/Menu originais.

## Como rodar

```bash
npm install
npm run dev        # abre em http://localhost:8080 (ou a porta que o Vite indicar)
```

Para publicar (Vercel, como o bolão): `npm run build` gera a pasta `dist/`.
Como é SPA com React Router, configure rewrite de todas as rotas para `/index.html`
(na Vercel: framework Vite já resolve; se precisar, `vercel.json` com rewrites).

O progresso (conta, cartas, ouro, XP, história) fica salvo no navegador (localStorage).

## O que está implementado

- **Splash 650x650** (original do Lovable) → Start leva ao login ou direto ao menu se já tem conta
- **Primeiro login**: nome + e-mail + silhueta de perfil + escolha das 20 cartas iniciais
- **Menu** (original do Lovable, estendido): nome + avatar (clique para trocar imagem de perfil),
  nível + barra de XP, ouro, botão Amigos, confirmação de saída
- **Deck**: leque de cartas + Editar Deck (coleção 2/3 em cima, selecionadas 1/3 embaixo,
  clique + confirmar) + Loja (zoom, comprar, confirmar compra)
- **Modo História**: mapa com 5 castelos (Mago → Guerreiro → Assassino → Fera → Demônio),
  cadeados, boss com nome e desafiar; recompensa só na primeira vitória de cada castelo
- **Versus BOT**: escolha a classe (mesmos bosses e decks da história — deck completo
  de 10 cartas da classe)
- **Batalha**: 6 rodadas, 3 locais (meio cabe 2, pontas cabem 3), poder = nº da rodada
  (não acumula), custo = rank, mão inicial 3 + compra 1 por rodada, vitória por locais
  com desempate por dano total
- **As 50 habilidades** das cartas, incluindo tokens (Sombra e Ilusão)
- **Economia**: cartas custam rank × 200; história dá 600–1400 de ouro e 100–300 de XP
  (1ª vez); bot dá 70 de ouro por vitória e 50 de XP por partida (mesmo perdendo);
  níveis 1–20 com ouro progressivo ao subir (350–1250) e modal de level up

## Decisões tomadas (me avise se quiser diferente)

1. **"20 cartas, 2 de cada rank" não fecha a conta** (2 × 5 ranks = 10). Como cada classe
   tem exatamente 2 cartas por rank, interpretei como **4 de cada rank** (4 × 5 = 20).
   Ajuste na constante `PER_RANK` em `src/game/data.ts`.
2. Quem começa a rodada 1 é **sorteado** e depois **alterna a cada rodada**.
   Mudar: função `starterOfRound` em `src/game/engine.ts`.
3. Deusa Felina: ao fim da rodada em que é invocada, abre um diálogo para mover (ou ficar).
4. Titã Furioso: trava o local (ninguém joga mais lá), mas as cartas presentes seguem contando.

## Estrutura do código do jogo

```
src/game/data.ts      # 50 cartas, bosses, preços, tabelas de XP/ouro
src/game/engine.ts    # motor de batalha + todas as habilidades (validado com 300 partidas simuladas)
src/game/save.ts      # save em localStorage, progressão de nível, silhuetas
src/components/game/  # componentes de UI do jogo (modal, miniatura, contadores...)
src/pages/            # Login, Menu, Perfil, Deck, DeckEditar, Loja, Jogar, Historia, Bots, Batalha
public/cards/         # as 50 cartas (jpg comprimido) + recortes de arte
```

## Fase 2 (precisa de servidor)

Login real com Gmail/Microsoft (OAuth), lista de amigos, chat, convite para duelo e
Random On-line com fila. Os botões já existem e explicam isso ao clicar.
Stack sugerida: **Next.js + Upstash Redis + Vercel** (a mesma do bolão da Copa) — ou
manter este front Vite e adicionar um backend leve (Fastify/Express + Upstash) com WebSocket.
