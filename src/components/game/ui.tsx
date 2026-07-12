import { type ReactNode } from "react";
import { type CardDef, cardImg, CARD_PRICE, PER_RANK, DECK_SIZE, BY_ID } from "@/game/data";
import { AVATAR_PATHS } from "@/game/save";
import mysticHall from "@/assets/mystic-hall.jpg";

// ---- fundo místico compartilhado (corredor gótico com runas) ----
export const MysticBG = ({ tint = "purple", intensity = 0.72 }: { tint?: "purple" | "amber" | "cyan" | "crimson"; intensity?: number }) => {
  const tints: Record<string, string> = {
    purple:  "linear-gradient(180deg, hsl(260 40% 6% / TINT), hsl(270 45% 10% / TINT))",
    amber:   "linear-gradient(180deg, hsl(20 45% 6% / TINT),  hsl(30 55% 10% / TINT))",
    cyan:    "linear-gradient(180deg, hsl(200 50% 5% / TINT), hsl(190 55% 10% / TINT))",
    crimson: "linear-gradient(180deg, hsl(350 45% 6% / TINT), hsl(0 55% 10% / TINT))",
  };
  const overlay = tints[tint].replace(/TINT/g, String(intensity));
  return (
    <>
      <div className="fixed inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: `url(${mysticHall})` }} />
      <div className="fixed inset-0 -z-10 pointer-events-none" style={{ background: overlay }} />
      <div className="fixed inset-0 -z-10 pointer-events-none" style={{
        background:
          "radial-gradient(ellipse at 15% 85%, hsl(var(--magic-glow) / 0.18), transparent 55%)," +
          "radial-gradient(ellipse at 85% 15%, hsl(var(--flame-glow) / 0.14), transparent 55%)," +
          "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)"
      }} />
    </>
  );
};


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

// ---- modal ornamentado (sem scrollbars) ----
export const GameModal = ({open, children, wide=false}:{open:boolean; children:ReactNode; wide?:boolean}) => {
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`ornate-border bg-card/95 backdrop-blur-md rounded-lg p-8 ${wide?"max-w-3xl":"max-w-lg"} w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200`}>
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
    className={`relative rounded-md overflow-hidden border transition-all duration-200 cursor-pointer aspect-[3/4] bg-black/50
      ${selected
        ? "card-selected border-lightning-glow"
        : "border-gold/40 hover:-translate-y-1 hover:scale-[1.04] hover:shadow-[0_10px_24px_rgba(0,0,0,0.7),0_0_18px_hsl(var(--magic-glow)/0.35)]"}
      ${dim ? "opacity-30 grayscale" : ""}`}
  >
    {def.token ? (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-b from-magic/30 to-card">
        <span className="text-4xl">{def.id==="_sombra"?"🗡":"☽"}</span>
        <span className="text-[0.7rem] font-bold text-gold-light tracking-wider uppercase">{def.name}</span>
      </div>
    ) : (
      <>
        <img src={cardImg(def)} alt={def.name} className="absolute inset-0 w-full h-full object-cover" draggable={false}/>
        <div
          className="absolute font-serif text-foreground/95 leading-[1.05] text-center flex items-center justify-center px-1"
          style={{ left:"9%", right:"9%", top:"78.5%", height:"11%", fontSize:"clamp(6px, 1.1cqw, 9px)", containerType:"inline-size", textShadow:"0 1px 2px rgba(0,0,0,0.9)" }}
        >
          <span className="line-clamp-3">{def.txt}</span>
        </div>
      </>
    )}
    <span className="absolute top-1 left-1 bg-black/80 border border-gold/60 text-gold-light text-[0.62rem] font-bold px-1.5 py-0.5 rounded">
      R{def.rank}
    </span>
    {selected && (
      <span className="absolute top-1 right-1 bg-lightning-glow text-black text-[0.6rem] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-[0_0_10px_hsl(var(--lightning-glow))]">
        ✓
      </span>
    )}
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

// ---- contadores por rank ----
export const RankCounts = ({ids}:{ids:string[]}) => {
  const cnt:Record<number,number> = {1:0,2:0,3:0,4:0,5:0};
  ids.forEach(id=>cnt[BY_ID[id].rank]++);
  return (
    <div className="flex gap-3 flex-nowrap text-xs text-muted-foreground items-center">
      {[1,2,3,4,5].map(r=>(
        <span key={r} className="whitespace-nowrap tabular-nums inline-block min-w-[3.4rem]">
          R{r}: <b className={cnt[r]===PER_RANK ? "text-gold-light" : "text-destructive"}>{cnt[r]}/{PER_RANK}</b>
        </span>
      ))}
      <span className="whitespace-nowrap tabular-nums inline-block min-w-[5.2rem]">
        Total: <b className={ids.length===DECK_SIZE ? "text-gold-light" : "text-foreground"}>{ids.length}/{DECK_SIZE}</b>
      </span>
    </div>
  );
};

export const PageHead = ({title, children}:{title:string; children?:ReactNode}) => (
  <div className="w-full flex items-center justify-between gap-3 flex-nowrap px-6 py-4 border-b border-gold/25 bg-black/30 backdrop-blur-md">
    <h2 className="text-2xl font-bold text-gold-light tracking-wider whitespace-nowrap">{title}</h2>
    <div className="flex gap-3 items-center flex-nowrap">{children}</div>
  </div>
);

export const GoldBadge = ({gold}:{gold:number}) => (
  <div className="ornate-border bg-card/80 backdrop-blur-md px-4 py-1.5 rounded-lg flex items-center gap-2">
    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-700 shadow-[0_0_8px_hsl(var(--gold-light)/0.8)]"/>
    <span className="text-gold-light font-bold">{gold}</span>
  </div>
);

export const GameButtonSm = ({children, onClick, disabled=false, danger=false, type}:
  {children:ReactNode; onClick?:()=>void; disabled?:boolean; danger?:boolean; type?:"button"|"submit"}) => (
  <button
    type={type}
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

// ---- Overlay de preview grande ao passar mouse ----
export const CardPreview = ({def, side="right"}:{def:CardDef|null; side?:"left"|"right"}) => {
  if(!def) return null;
  const pos = side==="left" ? "left-6" : "right-6";
  return (
    <div className={`fixed top-1/2 -translate-y-1/2 ${pos} z-[45] pointer-events-none animate-in fade-in zoom-in-95 duration-150`}>
      <div className="w-72 aspect-[3/4] rounded-lg border-2 border-gold-light overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_hsl(var(--magic-glow)/0.6)] bg-black">
        {def.token ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-magic/40 to-card">
            <span className="text-7xl">{def.id==="_sombra"?"🗡":"☽"}</span>
            <span className="text-lg font-bold text-gold-light tracking-widest uppercase">{def.name}</span>
            <span className="text-xs text-muted-foreground px-4 text-center">{def.txt}</span>
            <span className="text-sm text-lightning-glow font-bold">Rank {def.rank} · {def.dmg} de Dano</span>
          </div>
        ) : (
          <img src={cardImg(def)} alt={def.name} className="w-full h-full object-cover" draggable={false}/>
        )}
      </div>
    </div>
  );
};
