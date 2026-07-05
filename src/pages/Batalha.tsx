import { useEffect, useReducer, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  B, newBattle, startRound, starterOfRound, botTurn,
  playCard, moveCard, canPlayAt, cardCost, effDmg, locTotal, grandTotal,
  endRoundPhase1, endRoundPhase2, unplayCard,
  type BattleMeta, type CardInst, type FelinaPend, type Verdict, type Side,
} from "@/game/engine";
import { CARDS, STORY, REWARDS, cardImg, type CardDef } from "@/game/data";
import { loadSave, saveState, grantXp, type LevelUp } from "@/game/save";
import { GameModal, GameButtonSm, CardPreview } from "@/components/game/ui";
import { sfx } from "@/game/sfx";
import battleBg from "@/assets/battle-arena.jpg";

const LOC_NAMES = ["esquerdo","do meio","direito"];
const ROUND_SECONDS = 60;

const Batalha = () => {
  const navigate = useNavigate();
  const meta = (useLocation().state ?? null) as BattleMeta|null;
  const [, tick] = useReducer((x:number)=>x+1, 0);
  const [sel, setSel] = useState<CardInst|null>(null);
  const [felina, setFelina] = useState<FelinaPend[]>([]);
  const [result, setResult] = useState<{v:Verdict; gold:number; xp:number; msg:string; ups:LevelUp[]}|null>(null);
  const [lvlups, setLvlups] = useState<LevelUp[]|null>(null);
  const [preview, setPreview] = useState<{def:CardDef; side:"left"|"right"}|null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [turnLost, setTurnLost] = useState(false);
  // uid das cartas recém-jogadas (para animar)
  const [playedUids, setPlayedUids] = useState<Set<number>>(new Set());
  // local que acabou de receber uma carta (para flash)
  const [flashLoc, setFlashLoc] = useState<number|null>(null);
  const booted = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(()=>{
    if(booted.current) return;
    booted.current = true;
    const s = loadSave();
    if(!meta || !s?.created){ navigate("/jogar"); return; }
    const enemyDeck = CARDS.filter(c=>c.cls===meta.cls).map(c=>c.id);
    newBattle(s.deck, enemyDeck, meta);
    beginRound();
  }, []);

  // Timer da rodada
  useEffect(()=>{
    if(!B || B.over || felina.length || result) return;
    setTimeLeft(ROUND_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){ clearInterval(timerRef.current); handleTimerEnd(); return 0; }
        return t-1;
      });
    }, 1000);
    return ()=>clearInterval(timerRef.current);
  }, [B?.round, felina.length, result]);

  const handleTimerEnd = () => {
    // mostra overlay "perdeu o turno" e encerra
    setTurnLost(true);
    sfx.turnLose();
    setTimeout(()=>{ setTurnLost(false); endRound(); }, 2200);
  };

  const beginRound = ()=>{
    startRound();
    setPlayedUids(new Set());
    if(starterOfRound()==="e"){
      botTurn();
      toast.info("O inimigo começou esta rodada.", {duration:1500});
    }
    setSel(null);
    tick();
  };

  const clickLoc = (li:number)=>{
    if(!sel) return;
    const ci = sel;
    if(playCard("p", ci, li)){
      sfx.card();
      setSel(null);
      setPlayedUids(prev=>new Set([...prev, ci.uid]));
      setFlashLoc(li);
      setTimeout(()=>setFlashLoc(null), 500);
      tick();
    } else toast.error("Jogada inválida neste local.");
  };

  const clickPlayerCard = (ci:CardInst, li:number)=>{
    if(unplayCard("p", ci, li)){
      toast.info(`${ci.def.name} devolvida à mão.`, {duration:1200});
      setPlayedUids(prev=>{ const s=new Set(prev); s.delete(ci.uid); return s; });
      tick();
    }
  };

  const endRound = ()=>{
    if(!B || B.over || felina.length || result) return;
    clearInterval(timerRef.current);
    if(starterOfRound()==="p") botTurn();
    const pend = endRoundPhase1();
    if(pend.length){ setFelina(pend); tick(); return; }
    concludeRound();
  };

  const resolveFelina = (to:number)=>{
    const [cur, ...rest] = felina;
    if(to>=0) moveCard(cur.ci, "p", cur.li, to);
    setFelina(rest);
    if(!rest.length) concludeRound(); else tick();
  };

  const concludeRound = ()=>{
    const v = endRoundPhase2();
    if(v) return finish(v);
    setPlayedUids(new Set());
    beginRound();
  };

  const finish = (v:Verdict)=>{
    clearInterval(timerRef.current);
    if(v.winner==="p") sfx.win(); else if(v.winner==="e") sfx.lose();
    const s = loadSave()!;
    let gold = 0, xp = 0, msg = "";
    if(B.meta.mode==="story"){
      if(v.winner==="p"){
        if(!s.storyDone[B.meta.idx]){
          gold = STORY[B.meta.idx].gold; xp = STORY[B.meta.idx].xp;
          s.storyDone[B.meta.idx] = true;
          msg = B.meta.idx===4 ? "Você derrotou o último castelo. O Modo História está completo!" : "Novo castelo desbloqueado!";
        } else msg = "Revanche vencida — sem recompensas.";
      }
    } else {
      xp = REWARDS.bot.xp;
      if(v.winner==="p") gold = REWARDS.bot.gold;
    }
    s.gold += gold;
    const ups = grantXp(s, xp);
    saveState(s);
    setResult({v, gold, xp, msg, ups});
    tick();
  };

  const closeSpoils = ()=>{
    if(result?.ups.length){ setLvlups(result.ups); setResult(null); }
    else navigate("/menu");
  };
  const nextLvlup = ()=>{
    const rest = lvlups!.slice(1);
    if(rest.length) setLvlups(rest); else navigate("/menu");
  };

  if(!B) return null;

  const bcard = (ci:CardInst, side:Side, li:number)=>{
    const d = effDmg(ci, side, li);
    const delta = d - ci.def.dmg;
    const wasPlayedNow = side==="p" && B.playedThisRound.p.some(e=>e.ci===ci && e.li===li);
    const isNew = playedUids.has(ci.uid);
    const previewSide:"left"|"right" = li===2 ? "left" : "right";
    const enter = ()=>setPreview({def:ci.def, side:previewSide});
    const leave = ()=>setPreview(null);
    if(side==="e" && ci.hidden) return (
      <div key={ci.uid} className="w-14 h-[4.7rem] rounded border border-gold/40
        bg-[repeating-linear-gradient(45deg,hsl(240_20%_14%),hsl(240_20%_14%)_6px,hsl(240_25%_9%)_6px,hsl(240_25%_9%)_12px)]
        flex items-center justify-center text-lightning-glow text-xl font-bold">?</div>
    );
    if(ci.def.token) return (
      <div key={ci.uid}
        onMouseEnter={enter} onMouseLeave={leave}
        className={`w-14 rounded border border-magic/60 bg-gradient-to-b from-magic/25 to-card cursor-help ${isNew?"card-play-anim":""}`}>
        <div className="h-[3.9rem] flex items-center justify-center text-2xl">{ci.def.id==="_sombra"?"🗡":"☽"}</div>
        <span className="block text-center text-[0.62rem] font-bold bg-black/80 py-0.5">{d}</span>
      </div>
    );
    return (
      <div key={ci.uid}
        onMouseEnter={enter} onMouseLeave={leave}
        onClick={e=>{ e.stopPropagation(); if(wasPlayedNow) clickPlayerCard(ci, li); }}
        className={`w-14 relative rounded overflow-hidden border cursor-pointer transition-all duration-150
          ${isNew ? "card-play-anim" : ""}
          ${wasPlayedNow ? "border-lightning-glow ring-1 ring-lightning-glow/60 hover:-translate-y-1" : "border-gold/40"}`}>
        <img src={cardImg(ci.def)} alt={ci.def.name} className="w-full block" draggable={false}/>
        <span className={`absolute bottom-0 inset-x-0 text-center text-[0.62rem] font-bold bg-black/85 py-0.5
          ${delta>0?"text-green-400":delta<0?"text-destructive":"text-foreground"}`}>{d}</span>
      </div>
    );
  };

  const timerColor = timeLeft<=10 ? "text-destructive" : timeLeft<=20 ? "text-flame-glow" : "text-gold-light";

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none relative"
      style={{
        backgroundImage: `linear-gradient(hsl(var(--shadow-deep)/0.75), hsl(var(--shadow-deep)/0.9)), url(${battleBg})`,
        backgroundSize: 'cover', backgroundPosition: 'center'
      }}>

      {/* overlay "perdeu o turno" */}
      {turnLost && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none">
          <div className="turn-lost-overlay text-center">
            <p className="text-6xl font-bold text-destructive font-decorative tracking-widest drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]">
              PERDEU O TURNO
            </p>
            <p className="text-xl text-muted-foreground mt-2 tracking-widest">O tempo esgotou</p>
          </div>
        </div>
      )}

      {/* topo */}
      <div className="flex justify-between items-center px-4 py-2 text-sm bg-black/50 backdrop-blur-sm border-b border-gold/25">
        <span className="font-bold text-destructive tracking-wide">⚔ {B.meta.foe} — {grandTotal("e")}</span>
        <div className="flex flex-col items-center">
          <span className="font-bold text-gold-light tracking-widest font-decorative">RODADA {B.round} / 6</span>
          <span className={`font-bold text-xs tracking-widest ${timerColor}`}>⏱ {timeLeft}s</span>
        </div>
        <span className="font-bold text-lightning-glow tracking-wide">Você — {grandTotal("p")}</span>
      </div>
      {B.forcedLoc.p!==null && (
        <p className="text-destructive text-xs px-4 pb-1 bg-black/40">
          Ceifador Entediado: você deve jogar no local {LOC_NAMES[B.forcedLoc.p]} (se possível).
        </p>
      )}

      {/* tabuleiro */}
      <div className="flex-1 grid grid-cols-3 gap-3 px-3 pb-1 pt-2 min-h-0">
        {[0,1,2].map(li=>{
          const L = B.locs[li];
          const pt = locTotal("p",li), et = locTotal("e",li);
          const playable = !!sel && cardCost("p",sel.def)<=B.power.p && canPlayAt("p",li,sel.def);
          const pFull = L.cards.p.length>=L.cap && !L.locked;
          const eFull = L.cards.e.length>=L.cap && !L.locked;
          const emptyP = Math.max(0, L.cap - L.cards.p.length);
          const emptyE = Math.max(0, L.cap - L.cards.e.length);
          const isFlash = flashLoc===li;
          return (
            <div key={li} onClick={()=>clickLoc(li)}
              className={`relative grid grid-rows-[1fr_auto_1fr] rounded-lg border-2 backdrop-blur-sm bg-black/45 overflow-hidden transition-colors
                ${L.locked ? "border-destructive/60 bg-destructive/10"
                  : playable ? "border-lightning-glow shadow-[inset_0_0_30px_hsl(var(--lightning-glow)/0.25)] cursor-pointer"
                  : "border-gold/40"}
                ${isFlash ? "loc-flash" : ""}`}>
              <span className="absolute top-1 right-2 text-[0.6rem] text-muted-foreground z-10 font-runic tracking-widest">
                {L.cards.p.length}/{L.cap}
              </span>
              {L.locked && (
                <span className="destroyed-label absolute inset-0 flex items-center justify-center -rotate-12 text-destructive font-bold tracking-[0.25em] text-base pointer-events-none z-10 font-decorative">
                  LOCAL DESTRUÍDO
                </span>
              )}
              <div className={`flex flex-wrap gap-1.5 content-start p-2 border-b border-dashed border-gold/25 overflow-hidden rounded-t-md ${eFull?"loc-full":""}`}>
                {L.cards.e.map(c=>bcard(c,"e",li))}
                {!L.locked && Array.from({length:emptyE}).map((_,i)=>(
                  <div key={"es"+i} className="rune-slot w-14 h-[4.7rem] text-lg">✦</div>
                ))}
              </div>
              <div className="flex justify-between px-3 py-1 text-sm font-bold bg-black/70 border-y border-gold/25">
                <span className={`text-lightning-glow tabular-nums ${pt>et?"drop-shadow-[0_0_8px_hsl(var(--lightning-glow))]":""}`}>{pt}</span>
                <span className={`text-destructive tabular-nums ${et>pt?"drop-shadow-[0_0_8px_hsl(var(--destructive))]":""}`}>{et}</span>
              </div>
              <div className={`flex flex-wrap gap-1.5 content-start p-2 overflow-hidden rounded-b-md ${pFull?"loc-full":""}`}>
                {L.cards.p.map(c=>bcard(c,"p",li))}
                {!L.locked && Array.from({length:emptyP}).map((_,i)=>(
                  <div key={"ps"+i} className="rune-slot w-14 h-[4.7rem] text-lg">✦</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* mão + lateral */}
      <div className="flex items-end gap-4 px-3 pb-3 pt-2 bg-black/50 backdrop-blur-sm border-t border-gold/25 h-[9.5rem] flex-shrink-0">
        <div className="flex-1 flex gap-2 py-2 h-full items-end">
          {B.hands.p.map(ci=>{
            const cost = cardCost("p", ci.def);
            const cant = cost>B.power.p || ![0,1,2].some(li=>canPlayAt("p",li,ci.def));
            const isSel = sel===ci;
            return (
              <div key={ci.uid}
                onMouseEnter={()=>setPreview({def:ci.def, side:"right"})} onMouseLeave={()=>setPreview(null)}
                onClick={()=>{ if(isSel){ setSel(null); return; } setSel(ci); }}
                className={`relative w-[4.7rem] flex-shrink-0 rounded-md overflow-hidden border-2 cursor-pointer transition-all duration-150
                  ${isSel ? "border-lightning-glow -translate-y-3 scale-110 shadow-[0_0_22px_hsl(var(--lightning-glow)/0.7)]"
                          : "border-gold/40 hover:-translate-y-2"}
                  ${cant ? "opacity-45" : ""}`}>
                <img src={cardImg(ci.def)} alt={ci.def.name} className="w-full block" draggable={false}/>
                <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-200 to-cyan-800
                  text-[0.68rem] font-bold text-cyan-950 flex items-center justify-center shadow-[0_0_8px_hsl(var(--lightning-glow)/0.7)]">
                  {cost}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-2 min-w-[7rem]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white
            bg-gradient-to-br from-purple-300 to-purple-900 border-2 border-magic-glow/60
            shadow-[0_0_22px_hsl(var(--magic-glow)/0.65)]">
            {B.power.p}
          </div>
          <div className="w-12 h-16 rounded border border-gold/50 flex items-center justify-center text-gold-light font-bold text-sm
            bg-[repeating-linear-gradient(45deg,hsl(260_30%_16%),hsl(260_30%_16%)_5px,hsl(255_30%_11%)_5px,hsl(255_30%_11%)_10px)]">
            {B.decks.p.length}
          </div>
          <GameButtonSm onClick={endRound}>Encerrar rodada</GameButtonSm>
        </div>
      </div>

      <CardPreview def={preview?.def ?? null} side={preview?.side ?? "right"}/>

      {/* Deusa Felina */}
      <GameModal open={felina.length>0}>
        {felina.length>0 && (
          <>
            <h3 className="text-2xl font-bold text-gold-light text-center mb-4">Deusa Felina</h3>
            <p className="text-muted-foreground text-center mb-6">
              Deusa Felina está no local {LOC_NAMES[felina[0].li]}. Mover para onde?
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {felina[0].opts.map(o=>(
                <GameButtonSm key={o} onClick={()=>resolveFelina(o)}>
                  {LOC_NAMES[o][0].toUpperCase()+LOC_NAMES[o].slice(1)}
                </GameButtonSm>
              ))}
              <GameButtonSm onClick={()=>resolveFelina(-1)}>Ficar</GameButtonSm>
            </div>
          </>
        )}
      </GameModal>

      {/* Espólios */}
      <GameModal open={!!result}>
        {result && (
          <>
            <h3 className="text-xl font-bold text-gold-light text-center mb-2 font-decorative">Espólios da batalha</h3>
            <p className={`text-4xl font-bold text-center mb-4 tracking-widest font-decorative
              ${result.v.winner==="p" ? "text-green-400 drop-shadow-[0_0_16px_rgba(74,222,128,0.5)]"
                : result.v.winner==="e" ? "text-destructive" : "text-muted-foreground"}`}>
              {result.v.winner==="p" ? "VITÓRIA" : result.v.winner==="e" ? "DERROTA" : "EMPATE"}
            </p>
            {/* grid 2×2: locais/dano em cima, ouro/xp embaixo */}
            <div className="grid grid-cols-2 gap-3 mb-4 w-full max-w-xs mx-auto">
              {/* Locais */}
              <div className="rounded-md border border-gold/40 bg-black/50 px-3 py-3 flex flex-col items-center gap-1">
                <span className="text-2xl leading-none">🏰</span>
                <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Locais</span>
                <span className="text-lg font-bold tabular-nums text-lightning-glow">{result.v.wp} × {result.v.we}</span>
              </div>
              {/* Dano total — dois valores empilhados */}
              <div className="rounded-md border border-gold/40 bg-black/50 px-3 py-3 flex flex-col items-center gap-1">
                <span className="text-2xl leading-none">⚔️</span>
                <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Dano total</span>
                <span className="text-sm font-bold tabular-nums text-green-400 leading-tight">{result.v.tp.toLocaleString()}</span>
                <span className="text-[0.6rem] text-muted-foreground leading-none">vs</span>
                <span className="text-sm font-bold tabular-nums text-destructive leading-tight">{result.v.te.toLocaleString()}</span>
              </div>
              {/* Ouro */}
              <div className="rounded-md border border-gold/40 bg-black/50 px-3 py-3 flex flex-col items-center gap-1">
                <span className="text-2xl leading-none">🪙</span>
                <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Ouro</span>
                <span className="text-lg font-bold tabular-nums text-gold-light">+{result.gold}</span>
              </div>
              {/* XP */}
              <div className="rounded-md border border-gold/40 bg-black/50 px-3 py-3 flex flex-col items-center gap-1">
                <span className="text-2xl leading-none">✨</span>
                <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">XP</span>
                <span className="text-lg font-bold tabular-nums text-magic-glow">+{result.xp}</span>
              </div>
            </div>
            {result.msg && <p className="text-lightning-glow text-center text-sm mb-4">{result.msg}</p>}
            <div className="flex justify-center">
              <GameButtonSm onClick={closeSpoils}>Voltar ao menu</GameButtonSm>
            </div>
          </>
        )}
      </GameModal>

      {/* Level up */}
      <GameModal open={!!lvlups?.length}>
        {!!lvlups?.length && (
          <>
            <h3 className="text-xl font-bold text-gold-light text-center mb-2 font-decorative">Subiu de nível!</h3>
            <p className="text-4xl font-bold text-center text-green-400 drop-shadow-[0_0_16px_rgba(74,222,128,0.5)] mb-4 font-decorative">
              Nível {lvlups[0].level}
            </p>
            <p className="text-center font-bold mb-6">
              <span className="text-gold-light">+{lvlups[0].gold} de ouro</span>
            </p>
            <div className="flex justify-center">
              <GameButtonSm onClick={nextLvlup}>Continuar</GameButtonSm>
            </div>
          </>
        )}
      </GameModal>
    </div>
  );
};

export default Batalha;
