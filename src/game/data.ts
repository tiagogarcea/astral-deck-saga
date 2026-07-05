// ============ BANCO DE CARTAS / ECONOMIA ============
export interface CardDef {
  id: string; cls: string; rank: number; name: string; dmg: number;
  ab: string | null; txt: string; token?: boolean;
}

export const CARDS: CardDef[] = [
  // MAGO
  {id:"asa-celestial", cls:"Mago", rank:1, name:"Asa Celestial", dmg:300, ab:"asa", txt:"Ao Invocar: na próxima rodada, você recebe +1 de Poder."},
  {id:"maga-escarlate", cls:"Mago", rank:1, name:"Maga Escarlate", dmg:500, ab:"escarlate", txt:"Ao Invocar: se esta for a única carta que você jogou nesta rodada, recebe +500 de Dano."},
  {id:"imperador-zero", cls:"Mago", rank:2, name:"O Imperador Zero", dmg:1000, ab:"zero", txt:"Contínuo: cartas inimigas de Rank 1 neste local têm -300 de Dano."},
  {id:"mago-supremo", cls:"Mago", rank:2, name:"Mago Supremo", dmg:1200, ab:"supremo", txt:"Ao Invocar: recebe +200 de Dano para cada outra carta aliada em campo."},
  {id:"mago-do-controle", cls:"Mago", rank:3, name:"Mago do Controle", dmg:1600, ab:"controle", txt:"Contínuo: se o oponente jogou uma carta aqui na rodada anterior, recebe +500 de Dano."},
  {id:"jovem-prodigio", cls:"Mago", rank:3, name:"Jovem Prodígio", dmg:1700, ab:"prodigio", txt:"Ao Invocar: a próxima carta que você jogar custa 1 a menos (na próxima rodada)."},
  {id:"tirano-arcano", cls:"Mago", rank:4, name:"Tirano Arcano", dmg:2500, ab:"tirano", txt:"Contínuo: esta carta não pode ser destruída ou ter seu Dano reduzido."},
  {id:"viajante-milenar", cls:"Mago", rank:4, name:"Viajante Milenar", dmg:2400, ab:"viajante", txt:"Ao Invocar: você compra uma carta."},
  {id:"lorde-nexus", cls:"Mago", rank:5, name:"Lorde Nexus", dmg:3000, ab:"nexus", txt:"Ao Invocar: copia o Dano e a habilidade da carta inimiga de maior Dano em campo."},
  {id:"rei-da-magia", cls:"Mago", rank:5, name:"Rei da Magia", dmg:3000, ab:"rei", txt:"Ao Invocar: revive uma carta aliada aleatória que foi destruída (em um local aleatório)."},
  // ASSASSINO
  {id:"lenda-adormecida", cls:"Assassino", rank:1, name:"Lenda Adormecida", dmg:400, ab:"lenda", txt:"Ao Invocar: se este local estiver cheio do seu lado, recebe +600 de Dano."},
  {id:"sombra-sonica", cls:"Assassino", rank:1, name:"Sombra Sônica", dmg:500, ab:"sonica", txt:"No final da rodada, se o oponente jogou uma carta aqui, move esta carta para outro local."},
  {id:"braco-da-ruina", cls:"Assassino", rank:2, name:"Braço da Ruína", dmg:1300, ab:"ruina", txt:"Ao Invocar: destrói uma carta aliada neste local. Recebe +500 de Dano."},
  {id:"demonio-da-nevoa", cls:"Assassino", rank:2, name:"Demônio da Névoa", dmg:1200, ab:"nevoa", txt:"Ao Invocar: cartas inimigas jogadas aqui no próximo turno têm -400 de Dano."},
  {id:"deusa-felina", cls:"Assassino", rank:3, name:"Deusa Felina", dmg:1800, ab:"felina", txt:"Ao Invocar: você pode mover esta carta para outro local no final desta rodada."},
  {id:"algoz-dos-herois", cls:"Assassino", rank:3, name:"Algoz dos Heróis", dmg:1900, ab:"algoz", txt:"Ao Invocar: remove a habilidade da carta de maior Dano neste local."},
  {id:"vazio-imortal", cls:"Assassino", rank:4, name:"O Vazio Imortal", dmg:2600, ab:"vazio", txt:"Na primeira vez que esta carta seria destruída, ela sobrevive com 1000 de Dano."},
  {id:"maos-ocultas", cls:"Assassino", rank:4, name:"Mãos Ocultas", dmg:2500, ab:"maos", txt:"Ao Invocar: adiciona -200 de Dano a todas as cartas inimigas no local à direita."},
  {id:"relampago-fantasma", cls:"Assassino", rank:5, name:"Relâmpago Fantasma", dmg:3200, ab:"relampago", txt:"Ao Invocar: retorna uma carta inimiga de Rank 1 ou 2 deste local para a mão do oponente."},
  {id:"lamina-de-um-corte", cls:"Assassino", rank:5, name:"Lâmina de Um Corte", dmg:3000, ab:"umcorte", txt:"Ao Invocar: destrói uma carta inimiga aleatória neste local."},
  // GUERREIRO
  {id:"lamina-negra", cls:"Guerreiro", rank:1, name:"Lâmina Negra", dmg:400, ab:"negra", txt:"Ao Invocar: se você jogou uma carta no turno anterior, recebe +400 de Dano."},
  {id:"dragao-errante", cls:"Guerreiro", rank:1, name:"Dragão Errante", dmg:500, ab:"errante", txt:"Ao Invocar: move uma carta inimiga aleatória de Rank 1 deste local."},
  {id:"filho-do-trovao", cls:"Guerreiro", rank:2, name:"Filho do Trovão", dmg:1400, ab:"trovao", txt:"Se esta carta for destruída por uma habilidade inimiga, seu oponente descarta uma carta."},
  {id:"cacador-implacavel", cls:"Guerreiro", rank:2, name:"Caçador Implacável", dmg:1200, ab:"cacador", txt:"Contínuo: recebe +300 de Dano para cada carta inimiga neste local."},
  {id:"punho-kaiju", cls:"Guerreiro", rank:3, name:"Punho Kaiju", dmg:2000, ab:"kaiju", txt:"Ao Invocar: se jogado no local do meio, recebe +500 de Dano."},
  {id:"estocada-real", cls:"Guerreiro", rank:3, name:"Estocada Real", dmg:2100, ab:"estocada", txt:"Contínuo: esta carta não pode ser destruída por habilidades."},
  {id:"tita-furioso", cls:"Guerreiro", rank:4, name:"Titã Furioso", dmg:2800, ab:"tita", txt:"Ao Invocar: destrói este local na próxima rodada (cartas não podem mais ser jogadas aqui)."},
  {id:"lutador-marcado", cls:"Guerreiro", rank:4, name:"O Lutador Marcado", dmg:2500, ab:"marcado", txt:"Contínuo: recebe +200 de Dano para cada carta destruída neste jogo (máx. +1000)."},
  {id:"gigante-espiral", cls:"Guerreiro", rank:5, name:"Gigante Espiral", dmg:3500, ab:"espiral", txt:"Contínuo: recebe +200 de Dano para cada outra carta aliada em campo."},
  {id:"lamina-monarca", cls:"Guerreiro", rank:5, name:"Lâmina Monarca", dmg:3000, ab:"monarca", txt:"Ao Invocar: adiciona duas [Sombras 1/300] a este local (se houver espaço)."},
  // FERA
  {id:"fera-ruminante", cls:"Fera", rank:1, name:"Fera Ruminante", dmg:300, ab:"ruminante", txt:"Ao Invocar: adiciona +300 de Dano a todas as suas outras cartas neste local."},
  {id:"sobrevivente-do-abismo", cls:"Fera", rank:1, name:"Sobrevivente do Abismo", dmg:400, ab:"abismo", txt:"Contínuo: cartas aliadas neste local não podem ter seu Dano reduzido."},
  {id:"dragao-da-nevoa", cls:"Fera", rank:2, name:"Dragão da Névoa", dmg:1300, ab:"oculta", txt:"Ao Invocar: oculta a próxima carta que você jogar (o oponente não a vê até o final da rodada)."},
  {id:"grao-serpe-rubra", cls:"Fera", rank:2, name:"Grão-Serpe Rubra", dmg:1500, ab:"serpe", txt:"Contínuo: o oponente não pode jogar cartas de Rank 1 ou 2 neste local."},
  {id:"lobo-lendario", cls:"Fera", rank:3, name:"Lobo Lendário", dmg:1800, ab:"lobo", txt:"Contínuo: suas outras cartas neste local recebem +300 de Dano."},
  {id:"fera-biomecanica", cls:"Fera", rank:3, name:"Fera Biomecânica", dmg:1800, ab:"biomec", txt:"Contínuo: se esta for sua única carta aqui, seu Dano é dobrado."},
  {id:"ceifador-entediado", cls:"Fera", rank:4, name:"Ceifador Entediado", dmg:2700, ab:"ceifador", txt:"Ao Invocar: na próxima rodada, seu oponente deve jogar a(s) carta(s) dele aqui (se possível)."},
  {id:"metamorfo-perpetuo", cls:"Fera", rank:4, name:"Metamorfo Perpétuo", dmg:1000, ab:"metamorfo", txt:"Ao Invocar: transforma-se em uma cópia da carta de maior Dano no campo do oponente."},
  {id:"predador-fantasma", cls:"Fera", rank:5, name:"Predador Fantasma", dmg:3800, ab:"predador", txt:"Ao Invocar: destrói a carta aliada de menor Dano em campo. Recebe +500 de Dano."},
  {id:"fera-evolutiva", cls:"Fera", rank:5, name:"Fera Evolutiva", dmg:3000, ab:"evolutiva", txt:"Contínuo: recebe +300 de Dano por cada carta destruída neste local (aliada ou inimiga)."},
  // DEMÔNIO
  {id:"bruxa-primordial", cls:"Demônio", rank:1, name:"Bruxa Primordial", dmg:400, ab:"bruxa", txt:"Ao Invocar: adiciona -200 de Dano a uma carta inimiga aleatória neste local."},
  {id:"demonio-conquistador", cls:"Demônio", rank:1, name:"Demônio Conquistador", dmg:300, ab:"conquistador", txt:"Ao Invocar: puxa uma carta inimiga de Rank 1 aleatória para este local (se houver espaço)."},
  {id:"calamidade-selada", cls:"Demônio", rank:2, name:"Calamidade Selada", dmg:1000, ab:"calamidade", txt:"Ao Invocar: descarta a carta de menor Custo da sua mão. Ganha +500 de Dano."},
  {id:"espectro-veloz", cls:"Demônio", rank:2, name:"Espectro Veloz", dmg:1300, ab:"espectro", txt:"Ao Invocar: troca a posição de uma carta inimiga aleatória de outro local para este."},
  {id:"aranha-do-pesadelo", cls:"Demônio", rank:3, name:"Aranha do Pesadelo", dmg:1800, ab:"aranha", txt:"Ao Invocar: adiciona -300 de Dano a todas as cartas inimigas neste local."},
  {id:"trapaceiro-divino", cls:"Demônio", rank:3, name:"Trapaceiro Divino", dmg:1700, ab:"trapaceiro", txt:"Ao Invocar: substitui a carta de maior Dano do oponente neste local por uma [Ilusão 1/100]."},
  {id:"punho-da-lua", cls:"Demônio", rank:4, name:"Punho da Lua", dmg:2500, ab:"lua", txt:"Contínuo: se esta carta for destruída, ela regenera com 1000 de Dano em um local aleatório (uma vez)."},
  {id:"lorde-demonio-arcano", cls:"Demônio", rank:4, name:"Lorde Demônio Arcano", dmg:2600, ab:"lordedemonio", txt:"Contínuo: cartas inimigas de Rank 1, 2 e 3 não podem ser jogadas neste local."},
  {id:"imperador-abissal", cls:"Demônio", rank:5, name:"Imperador Abissal", dmg:3000, ab:"abissal", txt:"Ao Invocar: destrói TODAS as cartas de Rank 1 em campo (aliadas e inimigas). Ganha +200 por cada."},
  {id:"pregador-das-chamas", cls:"Demônio", rank:5, name:"Pregador das Chamas", dmg:3500, ab:"pregador", txt:"Contínuo: cartas inimigas em outros locais têm -200 de Dano."},
];

export const BY_ID: Record<string, CardDef> = Object.fromEntries(CARDS.map(c=>[c.id,c]));
export const CLASSES = ["Guerreiro","Mago","Assassino","Fera","Demônio"];

export const TOKENS: Record<string, CardDef> = {
  sombra: {id:"_sombra", cls:"Guerreiro", rank:1, name:"Sombra", dmg:300, ab:null, txt:"Invocada pela Lâmina Monarca.", token:true},
  ilusao: {id:"_ilusao", cls:"Demônio", rank:1, name:"Ilusão", dmg:100, ab:null, txt:"Criada pelo Trapaceiro Divino.", token:true},
};

export const STORY = [
  {cls:"Mago",      boss:"Rei da Magia",       img:"rei-da-magia",       gold:600,  xp:100},
  {cls:"Guerreiro", boss:"Lâmina Monarca",     img:"lamina-monarca",     gold:800,  xp:150},
  {cls:"Assassino", boss:"Relâmpago Fantasma", img:"relampago-fantasma", gold:1000, xp:200},
  {cls:"Fera",      boss:"Predador Fantasma",  img:"predador-fantasma",  gold:1200, xp:250},
  {cls:"Demônio",   boss:"Imperador Abissal",  img:"imperador-abissal",  gold:1400, xp:300},
];

export const CARD_PRICE = (r:number)=>r*200;
export const XP_TO_LEVEL = (lvl:number)=>100+(lvl-1)*50;
export const LEVEL_GOLD  = (lvl:number)=>350+(lvl-2)*50;
export const MAX_LEVEL = 20;
export const REWARDS = { bot:{gold:70, xp:50}, online:{gold:140, xp:100}, friend:{gold:0, xp:0} };
export const DECK_SIZE = 20;
export const PER_RANK = 4; // 20 cartas = 4 de cada rank (interpretação; ajuste aqui)

export const cardImg = (def:CardDef)=> def.token ? "" : `/cards/${def.id}.png`;
export const artImg  = (id:string)=> `/cards/${id}-art.jpg`;
