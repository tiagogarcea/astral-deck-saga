import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORY, BY_ID, cardImg } from "@/game/data";
import { loadSave } from "@/game/save";
import { GameButtonSm, GameModal, MysticBG } from "@/components/game/ui";

const CLASS_COLOR: Record<string, { text: string; glow: string; border: string }> = {
  Mago:      { text: "#d4a8ff", glow: "rgba(180,100,255,0.6)",  border: "#b464ff" },
  Guerreiro: { text: "#ffe0a0", glow: "rgba(255,160,40,0.6)",   border: "#ffa028" },
  Assassino: { text: "#a0ffee", glow: "rgba(80,220,180,0.6)",   border: "#50dcb4" },
  Fera:      { text: "#b0ffb0", glow: "rgba(80,200,80,0.6)",    border: "#50c850" },
  "Demônio": { text: "#ff9090", glow: "rgba(220,60,60,0.6)",    border: "#dc3c3c" },
};

const Bots = () => {
  const navigate = useNavigate();
  const s = loadSave();
  const [pick, setPick] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  if (!s?.created) { navigate("/login"); return null; }

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none relative">
      <MysticBG tint="crimson" />


      {/* fundo do boss em hover */}
      {hovered !== null && (
        <div
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `url(/cards/${STORY[hovered].img}.png)`,
            backgroundSize: "cover", backgroundPosition: "center top",
            opacity: 0.18, filter: "blur(3px) saturate(1.4)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60 pointer-events-none" />

      {/* cabeçalho */}
      <div className="relative w-full flex items-center justify-between px-6 py-4 border-b border-gold/25 bg-black/40 backdrop-blur-md z-10">
        <div>
          <h2 className="text-2xl font-bold text-gold-light tracking-wider font-decorative">Versus BOT</h2>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">Escolha seu adversário</p>
        </div>
        <GameButtonSm onClick={() => navigate("/jogar")}>Voltar</GameButtonSm>
      </div>

      {/* arena de seleção */}
      <div className="relative flex-1 flex items-center justify-center p-8 z-10">
        <div className="flex gap-8 flex-wrap justify-center items-stretch">
          {STORY.map((st, i) => {
            const c = CLASS_COLOR[st.cls] ?? CLASS_COLOR.Mago;
            const isHov = hovered === i;
            return (
              <div
                key={st.cls}
                className="flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 group"
                style={{ transform: isHov ? "translateY(-8px) scale(1.04)" : "none" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setPick(i)}
              >
                {/* retrato circular do boss */}
                <div
                  className="relative w-28 h-36 rounded-xl overflow-hidden transition-all duration-200 bg-transparent"
                  style={{
                    border: `3px solid ${c.border}`,
                    boxShadow: isHov
                      ? `0 0 32px 10px ${c.glow}, 0 0 0 4px ${c.border}44, inset 0 0 20px rgba(0,0,0,0.4)`
                      : `0 0 16px 4px ${c.glow}, inset 0 0 20px rgba(0,0,0,0.4)`,
                  }}
                >
                  <img
                    src={`/cards/${st.img}.png`}
                    alt={st.boss}
                    className="w-full h-full object-contain object-center"
                    draggable={false}
                  />
                  {/* gradiente sobre o retrato */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* nome e classe */}
                <div className="text-center">
                  <span className="block text-sm font-bold tracking-wide" style={{ color: c.text, textShadow: `0 0 12px ${c.glow}` }}>
                    {st.boss}
                  </span>
                  <span className="block text-[0.65rem] text-muted-foreground uppercase tracking-widest mt-0.5">
                    {st.cls}
                  </span>
                </div>

                {/* linha decorativa embaixo */}
                <div
                  className="h-0.5 w-20 rounded-full transition-all duration-200"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${c.border}, transparent)`,
                    opacity: isHov ? 1 : 0.4,
                    boxShadow: isHov ? `0 0 8px ${c.glow}` : "none",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* modal de confirmação */}
      <GameModal open={pick !== null} wide>
        {pick !== null && (() => {
          const st = STORY[pick];
          const c = CLASS_COLOR[st.cls] ?? CLASS_COLOR.Mago;
          return (
            <div className="flex gap-6 items-center flex-wrap justify-center">
              <img src={cardImg(BY_ID[st.img])} alt={st.boss} draggable={false}
                className="w-64 rounded-lg magical-glow"
                style={{ border: `2px solid ${c.border}` }}/>
              <div className="max-w-xs">
                <h3 className="text-2xl font-bold mb-1" style={{ color: c.text, textShadow: `0 0 16px ${c.glow}` }}>
                  {st.boss}
                </h3>
                <p className="text-xs uppercase tracking-widest mb-4 text-muted-foreground">
                  Duelo contra BOT — classe {st.cls}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  O BOT usa o deck completo da classe {st.cls} ({10} cartas). Você ganha{" "}
                  <span className="text-gold-light font-bold">70 de ouro</span> e{" "}
                  <span style={{ color: c.text }} className="font-bold">50 XP</span> por vitória.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <GameButtonSm onClick={() => navigate("/batalha", { state: { mode: "bot", idx: pick, cls: st.cls, foe: st.boss } })}>
                    Batalhar
                  </GameButtonSm>
                  <GameButtonSm onClick={() => setPick(null)}>Voltar</GameButtonSm>
                </div>
              </div>
            </div>
          );
        })()}
      </GameModal>
    </div>
  );
};

export default Bots;
