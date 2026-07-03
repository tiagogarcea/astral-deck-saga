// ============ MOTOR DE BATALHA ============
// 6 rodadas, 3 locais (pontas cabem 3, meio cabe 2), poder = nº da rodada.
import { BY_ID, TOKENS, type CardDef } from "./data";

export type Side = "p" | "e";
export interface CardInst {
  uid:number; def:CardDef; base:number; buff:number; noAb:boolean; hidden:boolean;
  vazioUsed:boolean; luaUsed:boolean; felinaPending:boolean;
}
interface Loc {
  cap:number; cards:Record<Side,CardInst[]>; locked:boolean;
  playDebuff:Record<Side,number>; playDebuffNext:Record<Side,number>;
  playedNow:Record<Side,boolean>; playedLast:Record<Side,boolean>;
  destroyedHere:number;
}
export interface BattleMeta { mode:"story"|"bot"; idx:number; cls:string; foe:string; }
export interface Battle {
  meta:BattleMeta; round:number; over:boolean; starter:Side;
  power:Record<Side,number>; powerBonus:Record<Side,number>;
  discount:Record<Side,number>; nextDiscount:Record<Side,number>;
  hideNext:Record<Side,boolean>;
  forcedLoc:Record<Side,number|null>; nextForcedLoc:Record<Side,number|null>;
  decks:Record<Side,CardInst[]>; hands:Record<Side,CardInst[]>;
  locs:Loc[];
  destroyed:Record<Side,CardDef[]>; destroyedTotal:number;
  playedThisRound:Record<Side,{ci:CardInst,li:number}[]>;
  playedLastAny:Record<Side,boolean>;
  log:string[];
}
export interface Verdict { winner:Side|"draw"; wp:number; we:number; tp:number; te:number; }
export interface FelinaPend { ci:CardInst; li:number; opts:number[]; }

let UID = 0;
const rnd = <T,>(a:T[]):T => a[Math.floor(Math.random()*a.length)];
const shuffle = <T,>(a:T[]):T[] => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; };
export const opp = (s:Side):Side => s==="p" ? "e" : "p";

function inst(def:CardDef):CardInst{
  return {uid:++UID, def, base:def.dmg, buff:0, noAb:false, hidden:false,
          vazioUsed:false, luaUsed:false, felinaPending:false};
}

export let B: Battle = null as unknown as Battle;

export function newBattle(playerIds:string[], enemyIds:string[], meta:BattleMeta):Battle{
  B = {
    meta, round:0, over:false,
    starter: Math.random()<.5 ? "p" : "e",
    power:{p:0,e:0}, powerBonus:{p:0,e:0},
    discount:{p:0,e:0}, nextDiscount:{p:0,e:0},
    hideNext:{p:false,e:false},
    forcedLoc:{p:null,e:null}, nextForcedLoc:{p:null,e:null},
    decks:{p:shuffle(playerIds).map(id=>inst(BY_ID[id])), e:shuffle(enemyIds).map(id=>inst(BY_ID[id]))},
    hands:{p:[],e:[]},
    locs:[0,1,2].map(i=>({cap:i===1?2:3, cards:{p:[],e:[]}, locked:false,
      playDebuff:{p:0,e:0}, playDebuffNext:{p:0,e:0},
      playedNow:{p:false,e:false}, playedLast:{p:false,e:false}, destroyedHere:0})),
    destroyed:{p:[],e:[]}, destroyedTotal:0,
    playedThisRound:{p:[],e:[]}, playedLastAny:{p:false,e:false},
    log:[]
  };
  for(let i=0;i<3;i++){ draw("p"); draw("e"); } // mão inicial: 3 cartas
  return B;
}

function draw(side:Side){ if(B.decks[side].length) B.hands[side].push(B.decks[side].shift()!); }
function log(msg:string){ B.log.push(msg); if(B.log.length>40) B.log.shift(); }

export function starterOfRound():Side{ // alterna a cada rodada a partir do sorteio inicial
  return (B.round % 2 === 1) ? B.starter : opp(B.starter);
}

export function startRound(){
  B.round++;
  (["p","e"] as Side[]).forEach(s=>{
    B.power[s] = B.round + B.powerBonus[s];
    B.powerBonus[s] = 0;
    draw(s);
  });
}

// ---------- proteções ----------
function protectedFromReduction(ci:CardInst, side:Side, li:number):boolean{
  if(ci.def.ab==="tirano" && !ci.noAb) return true;
  return B.locs[li].cards[side].some(a => a.def.ab==="abismo" && !a.noAb);
}
function permDebuff(ci:CardInst, side:Side, li:number, amount:number):boolean{
  if(protectedFromReduction(ci, side, li)) return false;
  ci.buff -= amount; return true;
}

// ---------- dano efetivo (contínuos) ----------
export function effDmg(ci:CardInst, side:Side, li:number):number{
  let d = ci.base + ci.buff;
  const L = B.locs[li], en = opp(side);
  if(!ci.noAb){
    switch(ci.def.ab){
      case "controle": if(L.playedLast[en]) d+=500; break;
      case "cacador":  d += 300 * L.cards[en].length; break;
      case "marcado":  d += 200 * Math.min(B.destroyedTotal,5); break;
      case "espiral":  d += 200 * (fieldCards(side).length - 1); break;
      case "evolutiva":d += 300 * L.destroyedHere; break;
    }
  }
  // auras aliadas no local (Lobo Lendário)
  L.cards[side].forEach(a=>{ if(a!==ci && a.def.ab==="lobo" && !a.noAb) d+=300; });
  // reduções contínuas inimigas
  let deb = 0;
  L.cards[en].forEach(x=>{
    if(x.noAb) return;
    if(x.def.ab==="zero" && ci.def.rank===1) deb+=300;
  });
  [0,1,2].forEach(oli=>{
    if(oli===li) return;
    B.locs[oli].cards[en].forEach(x=>{ if(!x.noAb && x.def.ab==="pregador") deb+=200; });
  });
  if(deb>0 && !protectedFromReduction(ci, side, li)) d -= deb;
  if(!ci.noAb && ci.def.ab==="biomec" && L.cards[side].length===1) d *= 2;
  return Math.max(d,0);
}
export function fieldCards(side:Side):CardInst[]{ const r:CardInst[]=[]; B.locs.forEach(L=>r.push(...L.cards[side])); return r; }
export function locTotal(side:Side, li:number):number{ return B.locs[li].cards[side].reduce((s,c)=>s+effDmg(c,side,li),0); }
export function grandTotal(side:Side):number{ return [0,1,2].reduce((s,li)=>s+locTotal(side,li),0); }

// ---------- regras de jogada ----------
export function cardCost(side:Side, def:CardDef):number{ return B.discount[side]>0 ? Math.max(def.rank-1,0) : def.rank; }
export function canPlayAt(side:Side, li:number, def:CardDef):boolean{
  const L = B.locs[li];
  if(L.locked) return false;
  if(L.cards[side].length >= L.cap) return false;
  const en = opp(side);
  for(const x of L.cards[en]){
    if(x.noAb) continue;
    if(x.def.ab==="serpe" && def.rank<=2) return false;
    if(x.def.ab==="lordedemonio" && def.rank<=3) return false;
  }
  const f = B.forcedLoc[side];
  if(f!==null && f!==li){
    // obrigado a jogar no local forçado, exceto se lá for impossível
    if(canPlayAtRaw(side, f, def)) return false;
  }
  return true;
}
function canPlayAtRaw(side:Side, li:number, def:CardDef):boolean{ // sem considerar forçamento
  const L = B.locs[li];
  if(L.locked || L.cards[side].length>=L.cap) return false;
  for(const x of L.cards[opp(side)]){
    if(x.noAb) continue;
    if(x.def.ab==="serpe" && def.rank<=2) return false;
    if(x.def.ab==="lordedemonio" && def.rank<=3) return false;
  }
  return true;
}

export function playCard(side:Side, ci:CardInst, li:number):boolean{
  const cost = cardCost(side, ci.def);
  if(cost > B.power[side] || !canPlayAt(side, li, ci.def)) return false;
  B.power[side] -= cost;
  if(B.discount[side]>0) B.discount[side]--;
  const h = B.hands[side]; h.splice(h.indexOf(ci),1);
  const L = B.locs[li];
  L.cards[side].push(ci);
  L.playedNow[side] = true;
  B.playedThisRound[side].push({ci, li});
  if(B.hideNext[side]){ ci.hidden=true; B.hideNext[side]=false; }
  if(L.playDebuff[side]>0) permDebuff(ci, side, li, L.playDebuff[side]);
  onPlay(ci, side, li);
  log(`${side==="p"?"Você":"Inimigo"} invocou ${ci.def.name} (${effDmg(ci,side,li)}).`);
  return true;
}

// ---------- destruição / movimentação ----------
function destroyCard(ci:CardInst, side:Side, li:number, byAbility:boolean, bySide:Side):boolean{
  if(byAbility && ci.def.ab==="estocada" && !ci.noAb) return false;
  if(ci.def.ab==="tirano" && !ci.noAb) return false;
  if(ci.def.ab==="vazio" && !ci.noAb && !ci.vazioUsed){
    ci.vazioUsed = true; ci.base = 1000; ci.buff = 0;
    log(`${ci.def.name} sobreviveu com 1000 de Dano.`); return false;
  }
  const L = B.locs[li], arr = L.cards[side], idx = arr.indexOf(ci);
  if(idx<0) return false;
  arr.splice(idx,1);
  B.destroyedTotal++; L.destroyedHere++;
  if(!ci.def.token) B.destroyed[side].push(ci.def);
  if(byAbility && bySide===opp(side) && ci.def.ab==="trovao" && !ci.noAb){
    const eh = B.hands[bySide];
    if(eh.length){ const d = rnd(eh); eh.splice(eh.indexOf(d),1); log(`Filho do Trovão caiu: ${bySide==="p"?"você":"o inimigo"} descartou uma carta.`); }
  }
  if(ci.def.ab==="lua" && !ci.noAb && !ci.luaUsed){
    const spots = [0,1,2].filter(x=>!B.locs[x].locked && B.locs[x].cards[side].length<B.locs[x].cap);
    if(spots.length){
      const n = inst(ci.def); n.luaUsed = true; n.base = 1000;
      const tl = rnd(spots); B.locs[tl].cards[side].push(n);
      log(`Punho da Lua regenerou com 1000 de Dano.`);
    }
  }
  return true;
}
export function moveCard(ci:CardInst, side:Side, fromLi:number, toLi:number):boolean{
  const T = B.locs[toLi];
  if(T.locked || T.cards[side].length>=T.cap) return false;
  const arr = B.locs[fromLi].cards[side], idx = arr.indexOf(ci);
  if(idx<0) return false;
  arr.splice(idx,1); T.cards[side].push(ci);
  return true;
}
function locWithSpace(side:Side, exceptLi:number):number[]{
  return [0,1,2].filter(li=>li!==exceptLi && !B.locs[li].locked && B.locs[li].cards[side].length<B.locs[li].cap);
}

// ---------- habilidades "Ao Invocar" ----------
function onPlay(ci:CardInst, side:Side, li:number){
  if(ci.noAb || !ci.def.ab) return;
  const L = B.locs[li], en = opp(side);
  switch(ci.def.ab){
    case "asa": B.powerBonus[side] += 1; break;
    case "prodigio": B.nextDiscount[side] += 1; break;
    case "viajante": draw(side); break;
    case "oculta": B.hideNext[side] = true; break;
    case "nevoa": L.playDebuffNext[en] += 400; break;
    case "ceifador": B.nextForcedLoc[en] = li; break;
    case "kaiju": if(li===1) ci.buff += 500; break;
    case "negra": if(B.playedLastAny[side]) ci.buff += 400; break;
    case "lenda": if(L.cards[side].length===L.cap) ci.buff += 600; break;
    case "supremo": ci.buff += 200 * (fieldCards(side).length - 1); break;
    case "ruminante": L.cards[side].forEach(a=>{ if(a!==ci) a.buff += 300; }); break;
    case "calamidade": {
      const h = B.hands[side];
      if(h.length){ const low = h.reduce((m,c)=>c.def.rank<m.def.rank?c:m,h[0]); h.splice(h.indexOf(low),1); ci.buff += 500; }
      break;
    }
    case "bruxa": { const t = L.cards[en]; if(t.length) permDebuff(rnd(t), en, li, 200); break; }
    case "aranha": L.cards[en].slice().forEach(x=>permDebuff(x, en, li, 300)); break;
    case "maos": if(li<2) B.locs[li+1].cards[en].slice().forEach(x=>permDebuff(x, en, li+1, 200)); break;
    case "algoz": {
      const pool:{x:CardInst,s:Side}[] = [];
      L.cards[en].forEach(x=>pool.push({x,s:en}));
      L.cards[side].forEach(x=>{ if(x!==ci) pool.push({x,s:side}); });
      if(pool.length){
        pool.sort((a,b)=> effDmg(b.x,b.s,li)-effDmg(a.x,a.s,li) || (a.s===en?-1:1));
        pool[0].x.noAb = true; log(`Habilidade de ${pool[0].x.def.name} foi removida.`);
      }
      break;
    }
    case "ruina": {
      const allies = L.cards[side].filter(a=>a!==ci);
      if(allies.length && destroyCard(rnd(allies), side, li, true, side)) ci.buff += 500;
      break;
    }
    case "predador": {
      const all:{a:CardInst,i:number}[] = [];
      B.locs.forEach((LL,i)=>LL.cards[side].forEach(a=>{ if(a!==ci) all.push({a,i}); }));
      if(all.length){
        all.sort((x,y)=>effDmg(x.a,side,x.i)-effDmg(y.a,side,y.i));
        if(destroyCard(all[0].a, side, all[0].i, true, side)) ci.buff += 500;
      }
      break;
    }
    case "umcorte": { const t = L.cards[en]; if(t.length) destroyCard(rnd(t), en, li, true, side); break; }
    case "abissal": {
      let n = 0;
      B.locs.forEach((LL,i)=>{
        (["p","e"] as Side[]).forEach(s=>{
          LL.cards[s].slice().forEach(x=>{ if(x!==ci && x.def.rank===1 && destroyCard(x,s,i,true,side)) n++; });
        });
      });
      ci.buff += 200*n; break;
    }
    case "trapaceiro": {
      const t = L.cards[en].slice().sort((a,b)=>effDmg(b,en,li)-effDmg(a,en,li));
      for(const x of t){
        if(destroyCard(x, en, li, true, side)){ L.cards[en].push(inst(TOKENS.ilusao)); break; }
      }
      break;
    }
    case "relampago": {
      const t = L.cards[en].filter(x=>x.def.rank<=2 && !x.def.token);
      if(t.length){ const x = rnd(t); L.cards[en].splice(L.cards[en].indexOf(x),1); B.hands[en].push(inst(x.def)); log(`${x.def.name} voltou para a mão do oponente.`); }
      break;
    }
    case "errante": {
      const t = L.cards[en].filter(x=>x.def.rank===1);
      if(t.length){ const x = rnd(t), sp = locWithSpace(en, li); if(sp.length) moveCard(x, en, li, rnd(sp)); }
      break;
    }
    case "conquistador": {
      const cands:{x:CardInst,o:number}[] = [];
      [0,1,2].forEach(o=>{ if(o!==li) B.locs[o].cards[en].forEach(x=>{ if(x.def.rank===1) cands.push({x,o}); }); });
      if(cands.length && L.cards[en].length<L.cap){ const c = rnd(cands); moveCard(c.x, en, c.o, li); }
      break;
    }
    case "espectro": {
      const cands:{x:CardInst,o:number}[] = [];
      [0,1,2].forEach(o=>{ if(o!==li) B.locs[o].cards[en].forEach(x=>cands.push({x,o})); });
      if(cands.length && L.cards[en].length<L.cap){ const c = rnd(cands); moveCard(c.x, en, c.o, li); }
      break;
    }
    case "monarca": {
      for(let k=0;k<2;k++) if(L.cards[side].length<L.cap) L.cards[side].push(inst(TOKENS.sombra));
      break;
    }
    case "rei": {
      const dead = B.destroyed[side];
      if(dead.length){
        const d = rnd(dead), spots = [0,1,2].filter(x=>!B.locs[x].locked && B.locs[x].cards[side].length<B.locs[x].cap);
        if(spots.length){ dead.splice(dead.indexOf(d),1); B.locs[rnd(spots)].cards[side].push(inst(d)); log(`${d.name} foi revivido!`); }
      }
      break;
    }
    case "nexus": case "metamorfo": {
      let best:CardInst|null = null, bd = -1;
      B.locs.forEach((LL,i)=>LL.cards[en].forEach(x=>{ const d = effDmg(x,en,i); if(d>bd){ bd=d; best=x; } }));
      if(best){
        const bestCi = best as CardInst;
        const keepName = ci.def.ab==="nexus";
        const nd = {...bestCi.def};
        if(keepName){ nd.name = ci.def.name; nd.id = ci.def.id; }
        ci.def = nd; ci.base = bestCi.base; ci.buff = bestCi.buff;
        log(`${keepName?"Lorde Nexus copiou":"Metamorfo virou"} ${bestCi.def.name}.`);
      }
      break;
    }
    case "felina": ci.felinaPending = true; break;
    case "sonica": case "escarlate": break; // resolvem no fim da rodada
  }
}

// ---------- fim de rodada (2 fases: fase 1 pode exigir escolha do jogador p/ Deusa Felina) ----------
export function endRoundPhase1():FelinaPend[]{
  // Maga Escarlate
  (["p","e"] as Side[]).forEach(s=>{
    B.playedThisRound[s].forEach(({ci})=>{
      if(ci.def.ab==="escarlate" && !ci.noAb && B.playedThisRound[s].length===1) ci.buff += 500;
    });
  });
  // Sombra Sônica
  (["p","e"] as Side[]).forEach(s=>{
    B.locs.forEach((L,li)=>{
      L.cards[s].slice().forEach(ci=>{
        if(ci.def.ab==="sonica" && !ci.noAb && L.playedNow[opp(s)]){
          const sp = locWithSpace(s, li);
          if(sp.length){ moveCard(ci, s, li, rnd(sp)); log(`Sombra Sônica escapou para outro local.`); }
        }
      });
    });
  });
  // Deusa Felina do bot: move gulosamente
  B.playedThisRound.e.forEach(({ci,li})=>{
    if(ci.def.ab==="felina" && ci.felinaPending && !ci.noAb){
      ci.felinaPending = false;
      let bestLi:number|null = null, bestScore = winCount("e");
      locWithSpace("e", li).forEach(t=>{
        moveCard(ci,"e",li,t);
        const sc = winCount("e");
        if(sc>bestScore){ bestScore=sc; bestLi=t; }
        moveCard(ci,"e",t,li);
      });
      if(bestLi!==null) moveCard(ci,"e",li,bestLi);
    }
  });
  // Deusa Felina do jogador: devolve pendências pra UI decidir
  const pend:FelinaPend[] = [];
  B.playedThisRound.p.forEach(({ci,li})=>{
    if(ci.def.ab==="felina" && ci.felinaPending && !ci.noAb){
      const opts = locWithSpace("p", li);
      if(opts.length) pend.push({ci, li, opts});
      ci.felinaPending = false;
    }
  });
  return pend;
}
export function endRoundPhase2():Verdict|null{
  // Titã Furioso trava o local
  (["p","e"] as Side[]).forEach(s=>{
    B.playedThisRound[s].forEach(({ci,li})=>{
      if(ci.def.ab==="tita" && !ci.noAb) B.locs[li].locked = true;
    });
  });
  // revela ocultas
  (["p","e"] as Side[]).forEach(s=>fieldCards(s).forEach(c=>c.hidden=false));
  // vira os marcadores de rodada
  (["p","e"] as Side[]).forEach(s=>{
    B.playedLastAny[s] = B.playedThisRound[s].length>0;
    B.playedThisRound[s] = [];
    B.discount[s] = B.nextDiscount[s]; B.nextDiscount[s]=0;
    B.forcedLoc[s] = B.nextForcedLoc[s]; B.nextForcedLoc[s]=null;
  });
  B.locs.forEach(L=>{
    (["p","e"] as Side[]).forEach(s=>{
      L.playedLast[s] = L.playedNow[s]; L.playedNow[s]=false;
      L.playDebuff[s] = L.playDebuffNext[s]; L.playDebuffNext[s]=0;
    });
  });
  if(B.round>=6){ B.over = true; return verdict(); }
  return null;
}

export function winCount(side:Side):number{
  let n=0;
  [0,1,2].forEach(li=>{ if(locTotal(side,li)>locTotal(opp(side),li)) n++; });
  return n;
}
export function verdict():Verdict{
  const wp = winCount("p"), we = winCount("e");
  const tp = grandTotal("p"), te = grandTotal("e");
  if(wp>we) return {winner:"p", wp, we, tp, te};
  if(we>wp) return {winner:"e", wp, we, tp, te};
  return {winner: tp>te ? "p" : (te>tp ? "e" : "draw"), wp, we, tp, te};
}

// ---------- IA do bot ----------
export function botTurn(){
  let guard = 30;
  while(guard-- > 0){
    const plays:{ci:CardInst,li:number,cost:number}[] = [];
    B.hands.e.forEach(ci=>{
      const cost = cardCost("e", ci.def);
      if(cost>B.power.e) return;
      [0,1,2].forEach(li=>{ if(canPlayAt("e",li,ci.def)) plays.push({ci,li,cost}); });
    });
    if(!plays.length) break;
    // prioriza a carta mais forte; escolhe o local onde mais precisa/ganha
    plays.sort((a,b)=> b.ci.def.dmg - a.ci.def.dmg);
    const top = plays.filter(p=>p.ci===plays[0].ci);
    top.sort((a,b)=>{
      const needA = locTotal("p",a.li)-locTotal("e",a.li);
      const needB = locTotal("p",b.li)-locTotal("e",b.li);
      const dA = a.ci.def.ab==="kaiju"&&a.li===1?500:0;
      const dB = b.ci.def.ab==="kaiju"&&b.li===1?500:0;
      return (needB+dB) - (needA+dA);
    });
    // evita reforçar local já muito ganho se houver opção melhor
    const pick = top.find(t=>locTotal("e",t.li) - locTotal("p",t.li) < 2500) || top[0];
    playCard("e", pick.ci, pick.li);
  }
}
