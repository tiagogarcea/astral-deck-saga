import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { STORY, BY_ID, artImg, cardImg } from "@/game/data";
import { loadSave } from "@/game/save";
import { PageHead, GameButtonSm, GameModal } from "@/components/game/ui";

const CASTLE_POS: [number,number][] = [[14,72],[32,38],[52,64],[71,32],[87,62]]; // % x,y

const Historia = () => {
  const navigate = useNavigate();
  const s = loadSave();
  const [challenge, setChallenge] = useState<number|null>(null);
  if(!s?.created){ navigate("/login"); return null; }

  const unlocked = (i:number)=> i===0 || s.storyDone[i-1];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <PageHead title="Modo História">
        <GameButtonSm onClick={()=>navigate("/jogar")}>Voltar</GameButtonSm>
      </PageHead>

      <div className="flex-1 relative">
        {/* nebulosas */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-magic-glow/15 blur-[110px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-flame-glow/12 blur-[110px]" />

        {/* caminho tracejado */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={CASTLE_POS.map(([x,y])=>`${x},${y}`).join(" ")}
            fill="none" stroke="hsl(var(--gold-ornate))" strokeWidth="0.5"
            strokeDasharray="2 1.6" opacity="0.7"/>
        </svg>

        {/* castelos */}
        {STORY.map((st,i)=>{
          const open = unlocked(i), done = s.storyDone[i];
          return (
            <div key={st.cls}
              className={`absolute w-32 text-center -translate-x-1/2 -translate-y-1/2 ${open?"cursor-pointer":"cursor-not-allowed"}`}
              style={{left:`${CASTLE_POS[i][0]}%`, top:`${CASTLE_POS[i][1]}%`}}
              onClick={()=> open ? setChallenge(i) : toast.error("Derrote o castelo anterior para desbloquear este.")}
            >
              <div className={`relative w-24 h-24 mx-auto rounded-full overflow-hidden border-[3px] transition-all duration-200
                ${done ? "border-green-500 shadow-[0_0_22px_rgba(74,222,128,0.4)]"
                  : open ? "border-gold shadow-[0_0_26px_hsl(var(--magic-glow)/0.45)] hover:scale-105 hover:border-gold-light"
                  : "border-muted grayscale brightness-[0.4]"}`}
                style={{backgroundImage:`url(${artImg(st.img)})`, backgroundSize:"cover", backgroundPosition:"center top"}}
              >
                {!open && <span className="absolute inset-0 flex items-center justify-center text-3xl drop-shadow-[0_2px_4px_#000]">🔒</span>}
              </div>
              <span className="block mt-2 text-sm font-bold text-gold-light drop-shadow-[0_2px_6px_#000]">
                Castelo {st.cls}{done && <span className="text-green-400"> ✓</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* boss: desafiar */}
      <GameModal open={challenge!==null} wide>
        {challenge!==null && (()=>{ const st = STORY[challenge]; return (
          <div className="flex gap-6 items-center flex-wrap justify-center">
            <img src={cardImg(BY_ID[st.img])} alt={st.boss} draggable={false}
              className="w-64 rounded-lg border border-gold/50 magical-glow"/>
            <div className="max-w-xs">
              <h3 className="text-2xl font-bold text-gold-light mb-1">{st.boss}</h3>
              <p className="text-lightning-glow text-xs uppercase tracking-widest mb-4">
                Guardião do Castelo {st.cls}
                {s.storyDone[challenge] && <span className="block mt-1 text-muted-foreground normal-case">Já derrotado — revanche não dá recompensa</span>}
              </p>
              <div className="flex gap-3 flex-wrap">
                <GameButtonSm onClick={()=>navigate("/batalha", {state:{mode:"story", idx:challenge, cls:st.cls, foe:st.boss}})}>
                  Desafiar
                </GameButtonSm>
                <GameButtonSm onClick={()=>setChallenge(null)}>Voltar</GameButtonSm>
              </div>
            </div>
          </div>
        ); })()}
      </GameModal>
    </div>
  );
};

export default Historia;
