import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORY, BY_ID, artImg, cardImg } from "@/game/data";
import { loadSave } from "@/game/save";
import { PageHead, GameButtonSm, GameModal } from "@/components/game/ui";

const Bots = () => {
  const navigate = useNavigate();
  const s = loadSave();
  const [pick, setPick] = useState<number|null>(null);
  if(!s?.created){ navigate("/login"); return null; }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHead title="Versus BOT — escolha a classe">
        <GameButtonSm onClick={()=>navigate("/jogar")}>Voltar</GameButtonSm>
      </PageHead>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex gap-10 flex-wrap justify-center">
          {STORY.map((st,i)=>(
            <div key={st.cls} className="text-center cursor-pointer group" onClick={()=>setPick(i)}>
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-[3px] border-gold
                shadow-[0_0_26px_hsl(var(--magic-glow)/0.45)] transition-all duration-200
                group-hover:scale-105 group-hover:border-gold-light"
                style={{backgroundImage:`url(${artImg(st.img)})`, backgroundSize:"cover", backgroundPosition:"center top"}}/>
              <span className="block mt-2 text-sm font-bold text-gold-light">{st.boss}</span>
              <span className="block text-xs text-muted-foreground">{st.cls}</span>
            </div>
          ))}
        </div>
      </div>

      <GameModal open={pick!==null} wide>
        {pick!==null && (()=>{ const st = STORY[pick]; return (
          <div className="flex gap-6 items-center flex-wrap justify-center">
            <img src={cardImg(BY_ID[st.img])} alt={st.boss} draggable={false}
              className="w-64 rounded-lg border border-gold/50 magical-glow"/>
            <div className="max-w-xs">
              <h3 className="text-2xl font-bold text-gold-light mb-1">{st.boss}</h3>
              <p className="text-lightning-glow text-xs uppercase tracking-widest mb-4">
                Duelo contra BOT — classe {st.cls}
              </p>
              <div className="flex gap-3 flex-wrap">
                <GameButtonSm onClick={()=>navigate("/batalha", {state:{mode:"bot", idx:pick, cls:st.cls, foe:st.boss}})}>
                  Batalhar
                </GameButtonSm>
                <GameButtonSm onClick={()=>setPick(null)}>Voltar</GameButtonSm>
              </div>
            </div>
          </div>
        ); })()}
      </GameModal>
    </div>
  );
};

export default Bots;
