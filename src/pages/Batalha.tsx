import { useEffect, useReducer, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  B, newBattle, startRound, starterOfRound, botTurn,
  playCard, moveCard, canPlayAt, cardCost, effDmg, locTotal, grandTotal,
  endRoundPhase1, endRoundPhase2,
  type BattleMeta, type CardInst, type FelinaPend, type Verdict, type Side,
} from "@/game/engine";
import { CARDS, STORY, REWARDS, cardImg } from "@/game/data";
import { loadSave, saveState, grantXp, type LevelUp } from "@/game/save";
import { GameModal, GameButtonSm } from "@/components/game/ui";

const LOC_NAMES = ["esquerdo","do meio","direito"];

const Batalha = () => {
  const navigate = useNavigate();
  const meta = (useLocation().state ?? null) as BattleMeta|null;
  const [, tick] = useReducer((x:number)=>x+1, 0);
  const [sel, setSel] = useState<CardInst|null>(null);
  const [felina, setFelina] = useState<FelinaPend[]>([]);
  const [result, setResult] = useState<{v:Verdict; gold:number; xp:number; msg:string; ups:LevelUp[]}|null>(null);
  const [lvlups, setLvlups] = useState<LevelUp[]|null>(null);
  const [tip, setTip] = useState("");
  const booted = useRef(false);
  const tipTimer = useRef<ReturnType<typeof setTimeout>>();

  // inicia a batalha uma vez
  useEffect(()=>{
    if(booted.current) return;
    booted.current = true;
    const s = loadSave();
    if(!meta || !s?.created){ navigate("/jogar"); return; }
    const enemyDeck = CARDS.filter(c=>c.cls===meta.cls).map(c=>c.id); // deck completo da classe
    newBattle(s.deck, enemyDeck, meta);
    beginRound();
  }, []);

  const showTip = (t:string)=>{
    setTip(t);
    clearTimeout(tipTimer.current);
    tipTimer.current = setTimeout(()=>setTip(""), 3200);
  };

  const beginRound = ()=>{
    startRound();
    if(starterOfRound()==="e"){
      botTurn();
      toast.info("O inimigo começou esta rodada.", {duration:1500});
    }
    setSel(null);
    tick();
  };

  const clickLoc = (li:number)=>{
    if(!sel) return;
    if(playCard("p", sel, li)){ setSel(null); tick(); }
    else toast.error("Jogada inválida neste local.");
  };

  const endRound = ()=>{
    if(!B || B.over || felina.length || result) return;
    if(starterOfRound()==="p") botTurn(); // quem não começou joga por último
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
    beginRound();
  };

  const finish = (v:Verdict)=>{
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
      xp = REWARDS.bot.xp; // XP mesmo perdendo
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
    if(side==="e" && ci.hidden) return (
      <div key={ci.uid} className="w-14 h-[4.7rem] rounded border border-gold/40 bg-[repeating-linear-gradient(45deg,hsl(240_20%_14%),hsl(240_20%_14%)_6px,hsl(240_25%_9%)_6px,hsl(240_25%_9%)_12px)]
        flex items-center justify-center text-lightning-glow text-xl font-bold">?</div>
    );
    const tipTxt = `${ci.def.name} — Dano ${d}${ci.noAb ? " (habilidade removida)" : " — "+ci.def.txt}`;
    if(ci.def.token) return (
      <div key={ci.uid} onClick={e=>{e.stopPropagation(); showTip(tipTxt);}}
        className="w-14 rounded border border-magic/60 bg-gradient-to-b from-magic/25 to-card cursor-pointer animate-in zoom-in-75 duration-300">
        <div className="h-[3.9rem] flex items-center justify-center text-2xl">{ci.def.id==="_sombra"?"🗡":"☽"}</div>
        <span className="block text-center text-[0.62rem] font-bold bg-black/80 py-0.5">{d}</span>
      </div>
    );
    return (
      <div key={ci.uid} onClick={e=>{e.stopPropagation(); showTip(tipTxt);}}
        className="w-14 relative rounded overflow-hidden border border-gold/40 cursor-pointer animate-in zoom-in-75 duration-300">
        <img src={cardImg(ci.def)} alt={ci.def.name} className="w-full block" draggable={false}/>
        <span className={`absolute bottom-0 inset-x-0 text-center text-[0.62rem] font-bold bg-black/85 py-0.5
          ${delta>0?"text-green-400":delta<0?"text-destructive":"text-foreground"}`}>{d}</span>
      </div>
    );
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden select-none">
      {/* topo */}
      <div className="flex justify-between items-center px-4 py-2 text-sm">
        <span className="font-bold text-destructive tracking-wide">⚔ {B.meta.foe} — {grandTotal("e")}</span>
        <span className="font-bold text-gold-light tracking-widest">RODADA {B.round} / 6</span>
        <span className="font-bold text-lightning-glow tracking-wide">Você — {grandTotal("p")}</span>
      </div>
      {B.forcedLoc.p!==null && (
        <p className="text-destructive text-xs px-4 pb-1">
          Ceifador Entediado: você deve jogar no local {LOC_NAMES[B.forcedLoc.p]} (se possível).
        </p>
      )}

      {/* tabuleiro */}
      <div className="flex-1 grid grid-cols-3 gap-3 px-3 pb-1 min-h-0">
        {[0,1,2].map(li=>{
          const L = B.locs[li];
          const pt = locTotal("p",li), et = locTotal("e",li);
          const playable = !!sel && cardCost("p",sel.def)<=B.power.p && canPlayAt("p",li,sel.def);
          return (
            <div key={li} onClick={()=>clickLoc(li)}
              className={`relative flex flex-col rounded-lg border backdrop-blur-sm bg-card/40 overflow-hidden transition-all
                ${L.locked ? "border-destructive/60 bg-destructive/10"
                  : playable ? "border-lightning-glow shadow-[0_0_18px_hsl(var(--lightning-glow)/0.35)] cursor-pointer"
                  : "border-gold/30"}`}>
              <span className="absolute top-1 right-2 text-[0.6rem] text-muted-foreground">{L.cards.p.length}/{L.cap}</span>
              {L.locked && (
                <span className="absolute inset-0 flex items-center justify-center -rotate-12 text-destructive font-bold tracking-[0.2em] text-sm pointer-events-none z-10">
                  LOCAL DESTRUÍDO
                </span>
              )}
              <div className="flex-1 flex flex-wrap gap-1.5 content-start p-2 border-b border-dashed border-gold/25">
                {L.cards.e.map(c=>bcard(c,"e",li))}
              </div>
              <div className={`flex justify-between px-3 py-1 text-sm font-bold bg-black/60 border-y border-gold/25`}>
                <span className={`text-lightning-glow ${pt>et?"drop-shadow-[0_0_8px_hsl(var(--lightning-glow))]":""}`}>{pt}</span>
                <span className="text-destructive">{et}</span>
              </div>
              <div className="flex-1 flex flex-wrap gap-1.5 content-start p-2">
                {L.cards.p.map(c=>bcard(c,"p",li))}
              </div>
            </div>
          );
        })}
      </div>

      {/* dica */}
      {tip && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 max-w-lg z-40 ornate-border bg-card/95 backdrop-blur-md rounded px-4 py-2 text-xs text-center">
          {tip}
        </div>
      )}

      {/* mão + lateral */}
      <div className="flex items-end gap-4 px-3 pb-3 pt-1">
        <div className="flex-1 flex gap-2 overflow-x-auto py-2 min-h-[7.5rem]">
          {B.hands.p.map(ci=>{
            const cost = cardCost("p", ci.def);
            const cant = cost>B.power.p || ![0,1,2].some(li=>canPlayAt("p",li,ci.def));
            return (
              <div key={ci.uid}
                onClick={()=>{
                  if(sel===ci){ showTip(`${ci.def.name} — ${ci.def.txt}`); return; }
                  setSel(ci);
                  showTip(`${ci.def.name} (custo ${cost}) — toque em um local iluminado para invocar.`);
                }}
                className={`relative w-[4.7rem] flex-shrink-0 rounded-md overflow-hidden border cursor-pointer transition-all duration-150
                  ${sel===ci ? "border-lightning-glow -translate-y-2 shadow-[0_0_18px_hsl(var(--lightning-glow)/0.55)]" : "border-gold/40 hover:-translate-y-2"}
                  ${cant ? "opacity-40" : ""}`}>
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

      {/* Deusa Felina: escolha de movimento */}
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

      {/* espólios */}
      <GameModal open={!!result}>
        {result && (
          <>
            <h3 className="text-xl font-bold text-gold-light text-center mb-2">Espólios da batalha</h3>
            <p className={`text-4xl font-bold text-center mb-3 tracking-wider
              ${result.v.winner==="p" ? "text-green-400 drop-shadow-[0_0_16px_rgba(74,222,128,0.5)]"
                : result.v.winner==="e" ? "text-destructive" : "text-muted-foreground"}`}>
              {result.v.winner==="p" ? "VITÓRIA" : result.v.winner==="e" ? "DERROTA" : "EMPATE"}
            </p>
            <p className="text-muted-foreground text-center text-sm mb-4">
              Locais: {result.v.wp} x {result.v.we} — Dano total: {result.v.tp} x {result.v.te}
            </p>
            <div className="flex gap-8 justify-center font-bold mb-4">
              <span>Ouro <span className="text-gold-light">+{result.gold}</span></span>
              <span>XP <span className="text-gold-light">+{result.xp}</span></span>
            </div>
            {result.msg && <p className="text-lightning-glow text-center text-sm mb-4">{result.msg}</p>}
            <div className="flex justify-center">
              <GameButtonSm onClick={closeSpoils}>Voltar ao menu</GameButtonSm>
            </div>
          </>
        )}
      </GameModal>

      {/* level up (estilo espólio) */}
      <GameModal open={!!lvlups?.length}>
        {!!lvlups?.length && (
          <>
            <h3 className="text-xl font-bold text-gold-light text-center mb-2">Subiu de nível!</h3>
            <p className="text-4xl font-bold text-center text-green-400 drop-shadow-[0_0_16px_rgba(74,222,128,0.5)] mb-4">
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
