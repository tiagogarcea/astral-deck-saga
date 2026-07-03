import { type ReactNode } from "react";
import { type CardDef, cardImg, CARD_PRICE, PER_RANK, DECK_SIZE, BY_ID } from "@/game/data";
import { AVATAR_PATHS } from "@/game/save";

// ---- silhueta de perfil ----
export const AvatarIcon = ({cls, size=44, selected=false, onClick}:{cls:string; size?:number; selected?:boolean; onClick?:()=>void}) => (
  <div
    onClick={onClick}
    className={`rounded-full flex items-center justify-center transition-all duration-200 border-2
      ${selected ? "border-gold-light shadow-[0_0_20px_hsl(var(--gold-light)/0.6)]" : "border-gold/50"}
      ${onClick ? "cursor-pointer hover:border-gold-light hover:scale-105" : ""}
      bg-gradient-to-b from-card to-[hsl(var(--shadow-deep))]`}
    style={{width:size+30, height:size+30}}
  >
    <svg viewBox="0 0 24 24" style={{width:size, height:size}}
      className={selected ? "fill-gold-light" : "fill-muted-foreground"}>
      <path d={AVATAR_PATHS[cls] || AVATAR_PATHS.Guerreiro} />
    </svg>
  </div>
);

// ---- modal ornamentado ----
export const GameModal = ({open, children, wide=false}:{open:boolean; children:ReactNode; wide?:boolean}) => {
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`ornate-border bg-card/95 backdrop-blur-md rounded-lg p-8 ${wide?"max-w-3xl":"max-w-lg"} w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200`}>
        {children}
      </div>
    </div>
  );
};

// ---- miniatura de carta ----
export const CardThumb = ({def, selected=false, dim=false, price=false, ownedTag=false, onClick}:
  {def:CardDef; selected?:boolean; dim?:boolean; price?:boolean; ownedTag?:boolean; onClick?:()=>void}) => (
  <div
    onClick={onClick}
    className={`relative rounded-md overflow-hidden border transition-all duration-150 cursor-pointer
      ${selected ? "border-gold-light shadow-[0_0_18px_hsl(var(--gold-light)/0.55)]" : "border-gold/40"}
      ${dim ? "opacity-30 grayscale" : "hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.7),0_0_18px_hsl(var(--magic-glow)/0.35)]"}`}
  >
    <img src={cardImg(def)} alt={def.name} className="w-full block" draggable={false}/>
    <span className="absolute top-1 left-1 bg-black/80 border border-gold/60 text-gold-light text-[0.62rem] font-bold px-1.5 py-0.5 rounded">
      R{def.rank}
    </span>
    {price && (
      <span className="absolute bottom-1 right-1 bg-black/85 border border-gold/60 text-gold-light text-[0.66rem] font-bold px-1.5 py-0.5 rounded">
        {CARD_PRICE(def.rank)} 🪙
      </span>
    )}
    {ownedTag && (
      <span className="absolute bottom-1 left-1 bg-green-950/85 border border-green-500/60 text-green-400 text-[0.6rem] font-bold px-1.5 py-0.5 rounded">
        SUA
      </span>
    )}
  </div>
);

// ---- contadores por rank (deck de 20, 4 por rank) ----
export const RankCounts = ({ids}:{ids:string[]}) => {
  const cnt:Record<number,number> = {1:0,2:0,3:0,4:0,5:0};
  ids.forEach(id=>cnt[BY_ID[id].rank]++);
  return (
    <div className="flex gap-3 flex-wrap text-xs text-muted-foreground items-center">
      {[1,2,3,4,5].map(r=>(
        <span key={r}>R{r}: <b className={cnt[r]===PER_RANK ? "text-gold-light" : "text-destructive"}>{cnt[r]}/{PER_RANK}</b></span>
      ))}
      <span>Total: <b className={ids.length===DECK_SIZE ? "text-gold-light" : "text-foreground"}>{ids.length}/{DECK_SIZE}</b></span>
    </div>
  );
};

// ---- cabeçalho de página ----
export const PageHead = ({title, children}:{title:string; children?:ReactNode}) => (
  <div className="w-full flex items-center justify-between gap-3 flex-wrap px-6 py-4 border-b border-gold/25 bg-black/30 backdrop-blur-md">
    <h2 className="text-2xl font-bold text-gold-light tracking-wider">{title}</h2>
    <div className="flex gap-3 items-center flex-wrap">{children}</div>
  </div>
);

// ---- indicador de ouro ----
export const GoldBadge = ({gold}:{gold:number}) => (
  <div className="ornate-border bg-card/80 backdrop-blur-md px-4 py-1.5 rounded-lg flex items-center gap-2">
    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-700 shadow-[0_0_8px_hsl(var(--gold-light)/0.8)]"/>
    <span className="text-gold-light font-bold">{gold}</span>
  </div>
);

// ---- botão secundário menor ----
export const GameButtonSm = ({children, onClick, disabled=false, danger=false}:
  {children:ReactNode; onClick?:()=>void; disabled?:boolean; danger?:boolean}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`ornate-border px-4 py-2 font-bold text-sm tracking-wider uppercase rounded backdrop-blur-md
      transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:scale-100
      ${danger
        ? "bg-destructive/20 text-destructive hover:bg-destructive/35"
        : "bg-gold/10 text-foreground hover:bg-gold/25 hover:text-gold-light"}
      hover:scale-[1.03]`}
  >
    {children}
  </button>
);
