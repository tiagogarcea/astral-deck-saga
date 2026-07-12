import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { STORY, BY_ID, cardImg } from "@/game/data";
import { loadSave } from "@/game/save";
import { GameButtonSm, GameModal } from "@/components/game/ui";
import storyMap from "@/assets/story-map.jpg";


const CASTLE_POS: [number, number][] = [[14,72],[32,38],[52,64],[71,32],[87,62]];

// Paleta de cor por classe para os halos dos castelos
const CLASS_GLOW: Record<string, string> = {
  Mago:      "rgba(180,100,255,0.65)",
  Guerreiro: "rgba(255,160,40,0.65)",
  Assassino: "rgba(80,220,180,0.65)",
  Fera:      "rgba(80,200,80,0.65)",
  "Demônio": "rgba(220,60,60,0.65)",
};
const CLASS_BORDER: Record<string, string> = {
  Mago:      "#b464ff",
  Guerreiro: "#ffa028",
  Assassino: "#50dcb4",
  Fera:      "#50c850",
  "Demônio": "#dc3c3c",
};

// SVG de castelo estilizado por classe — gerado inline (sem assets externos)
const CastleSVG = ({ cls, size = 80 }: { cls: string; size?: number }) => {
  const colors: Record<string, { base: string; accent: string; glow: string }> = {
    Mago:      { base: "#3a1a6e", accent: "#b464ff", glow: "#d4a8ff" },
    Guerreiro: { base: "#5a3000", accent: "#ffa028", glow: "#ffe0a0" },
    Assassino: { base: "#003a3a", accent: "#50dcb4", glow: "#a0ffee" },
    Fera:      { base: "#1a3a00", accent: "#50c850", glow: "#b0ffb0" },
    "Demônio": { base: "#3a0000", accent: "#dc3c3c", glow: "#ff9090" },
  };
  const c = colors[cls] ?? colors.Mago;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`cg-${cls}`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={c.glow} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={c.base} stopOpacity="0"/>
        </radialGradient>
        <filter id={`glow-${cls}`}>
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* base do castelo */}
      <rect x="18" y="42" width="44" height="30" rx="2" fill={c.base} stroke={c.accent} strokeWidth="1.5"/>
      {/* torre esquerda */}
      <rect x="12" y="30" width="18" height="44" rx="2" fill={c.base} stroke={c.accent} strokeWidth="1.5"/>
      {/* torre direita */}
      <rect x="50" y="30" width="18" height="44" rx="2" fill={c.base} stroke={c.accent} strokeWidth="1.5"/>
      {/* ameias torre esquerda */}
      {[14,19,24].map(x=><rect key={x} x={x} y="24" width="4" height="8" rx="1" fill={c.base} stroke={c.accent} strokeWidth="1.2"/>)}
      {/* ameias torre direita */}
      {[52,57,62].map(x=><rect key={x} x={x} y="24" width="4" height="8" rx="1" fill={c.base} stroke={c.accent} strokeWidth="1.2"/>)}
      {/* ameias centro */}
      {[26,33,40,47].map(x=><rect key={x} x={x} y="36" width="5" height="7" rx="1" fill={c.base} stroke={c.accent} strokeWidth="1.1"/>)}
      {/* porta */}
      <path d="M32 72 Q32 60 40 60 Q48 60 48 72" fill={c.accent} opacity="0.3"/>
      <rect x="32" y="60" width="16" height="12" rx="1" fill={c.base} stroke={c.accent} strokeWidth="1.2"/>
      <path d="M32 62 Q40 57 48 62" fill="none" stroke={c.accent} strokeWidth="1.2"/>
      {/* janelas */}
      <rect x="19" y="48" width="6" height="8" rx="1" fill={c.accent} opacity="0.5"/>
      <rect x="55" y="48" width="6" height="8" rx="1" fill={c.accent} opacity="0.5"/>
      {/* brasão central */}
      <circle cx="40" cy="50" r="5" fill={c.base} stroke={c.accent} strokeWidth="1.5"/>
      <text x="40" y="54" textAnchor="middle" fontSize="7" fill={c.glow} filter={`url(#glow-${cls})`}>
        {cls[0]}
      </text>
      {/* halo */}
      <circle cx="40" cy="40" r="38" fill={`url(#cg-${cls})`}/>
    </svg>
  );
};

// SVG do caminho entre castelos — mais elaborado com pergaminhos
const StoryPath = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <filter id="path-glow">
        <feGaussianBlur stdDeviation="0.6" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* sombra do caminho */}
    <polyline
      points={CASTLE_POS.map(([x,y])=>`${x},${y}`).join(" ")}
      fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.4" strokeLinecap="round"
    />
    {/* caminho principal dourado */}
    <polyline
      points={CASTLE_POS.map(([x,y])=>`${x},${y}`).join(" ")}
      fill="none"
      stroke="hsl(40 100% 65%)"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeDasharray="3 1.5"
      opacity="0.9"
      filter="url(#path-glow)"
    />
    {/* linha central brilhante mais fina */}
    <polyline
      points={CASTLE_POS.map(([x,y])=>`${x},${y}`).join(" ")}
      fill="none"
      stroke="hsl(40 100% 90%)"
      strokeWidth="0.25"
      strokeLinecap="round"
      opacity="0.7"
    />
    {/* nós nos pontos de junção */}
    {CASTLE_POS.map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.9" fill="hsl(40 100% 75%)" opacity="0.8"/>
    ))}
  </svg>
);

const Historia = () => {
  const navigate = useNavigate();
  const s = loadSave();
  const [challenge, setChallenge] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  if (!s?.created) { navigate("/login"); return null; }

  const unlocked = (i: number) => i === 0 || s.storyDone[i - 1];

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none"
      style={{
        background: "radial-gradient(ellipse at 20% 80%, rgba(60,20,100,0.5), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(100,40,10,0.4), transparent 55%), hsl(240 20% 6%)"
      }}>

      {/* cabeçalho */}
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gold/25 bg-black/40 backdrop-blur-md z-10">
        <h2 className="text-2xl font-bold text-gold-light tracking-wider font-decorative">Modo História</h2>
        <GameButtonSm onClick={() => navigate("/jogar")}>Voltar</GameButtonSm>
      </div>

      {/* mapa */}
      <div className="flex-1 relative overflow-hidden">
        {/* fundo do castelo em hover — aparece com fade */}
        {hovered !== null && (
          <div
            className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
            style={{
              backgroundImage: `url(/cards/${STORY[hovered].img}.png)`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: 0.13, filter: "blur(2px) saturate(1.5)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

        <StoryPath />

        {STORY.map((st, i) => {
          const open = unlocked(i), done = s.storyDone[i];
          const isHov = hovered === i;
          const border = done ? "#4ade80" : open ? CLASS_BORDER[st.cls] : "#4c4568";
          const glow = done ? "rgba(74,222,128,0.5)" : open ? CLASS_GLOW[st.cls] : "transparent";
          return (
            <div
              key={st.cls}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-all duration-200 z-10
                ${open ? "cursor-pointer" : "cursor-not-allowed"}`}
              style={{ left: `${CASTLE_POS[i][0]}%`, top: `${CASTLE_POS[i][1]}%` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => open ? setChallenge(i) : toast.error("Derrote o castelo anterior para desbloquear este.")}
            >
              {/* anel de glow */}
              <div
                className="rounded-full p-1 transition-all duration-200"
                style={{
                  boxShadow: isHov && open ? `0 0 28px 8px ${glow}, 0 0 60px 16px ${glow}` : `0 0 14px 4px ${glow}`,
                  transform: isHov && open ? "scale(1.12)" : "scale(1)",
                  border: `2.5px solid ${border}`,
                  background: "rgba(10,8,20,0.7)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {open ? (
                  <CastleSVG cls={st.cls} size={72}/>
                ) : (
                  <div className="w-[72px] h-[72px] flex items-center justify-center" style={{filter:"grayscale(1) brightness(0.35)"}}>
                    <CastleSVG cls={st.cls} size={72}/>
                    <span className="absolute text-3xl drop-shadow-[0_2px_4px_#000]">🔒</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <span className="block text-xs font-bold drop-shadow-[0_2px_6px_#000]"
                  style={{color: open ? border : "#6b6380"}}>
                  {st.cls}{done && <span className="text-green-400"> ✓</span>}
                </span>
                {open && (
                  <span className="block text-[0.6rem] text-muted-foreground drop-shadow-[0_1px_4px_#000]">{st.boss}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* modal de desafio */}
      <GameModal open={challenge !== null} wide>
        {challenge !== null && (() => {
          const st = STORY[challenge];
          return (
            <div className="flex gap-6 items-center flex-wrap justify-center">
              <img src={cardImg(BY_ID[st.img])} alt={st.boss} draggable={false}
                className="w-64 rounded-lg border border-gold/50 magical-glow"/>
              <div className="max-w-xs">
                <h3 className="text-2xl font-bold mb-1" style={{color: CLASS_BORDER[st.cls]}}>{st.boss}</h3>
                <p className="text-xs uppercase tracking-widest mb-1 text-muted-foreground">
                  Guardião do Castelo {st.cls}
                </p>
                {s.storyDone[challenge] && (
                  <p className="text-xs text-muted-foreground mb-4">Já derrotado — revanche não dá recompensa</p>
                )}
                <div className="flex gap-3 flex-wrap mt-4">
                  <GameButtonSm onClick={() => navigate("/batalha", { state: { mode: "story", idx: challenge, cls: st.cls, foe: st.boss } })}>
                    Desafiar
                  </GameButtonSm>
                  <GameButtonSm onClick={() => setChallenge(null)}>Voltar</GameButtonSm>
                </div>
              </div>
            </div>
          );
        })()}
      </GameModal>
    </div>
  );
};

export default Historia;
