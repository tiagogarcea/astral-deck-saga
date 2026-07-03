import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadSave, saveState } from "@/game/save";
import { CLASSES } from "@/game/data";
import { AvatarIcon, PageHead, GameButtonSm } from "@/components/game/ui";

const Perfil = () => {
  const navigate = useNavigate();
  const s = loadSave();
  const [preview, setPreview] = useState(s?.avatar ?? "Guerreiro");
  if(!s?.created){ navigate("/login"); return null; }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHead title="Imagem de perfil"/>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
        <AvatarIcon cls={preview} size={72}/>
        <div className="flex gap-4 justify-center flex-wrap">
          {CLASSES.map(cls=>(
            <div key={cls} className="flex flex-col items-center gap-1.5">
              <AvatarIcon cls={cls} selected={preview===cls} onClick={()=>setPreview(cls)}/>
              <span className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">{cls}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <GameButtonSm onClick={()=>{ s.avatar = preview; saveState(s); navigate("/menu"); }}>Confirmar</GameButtonSm>
          <GameButtonSm onClick={()=>setPreview(s.avatar)}>Desfazer</GameButtonSm>
          <GameButtonSm onClick={()=>navigate("/menu")}>Voltar</GameButtonSm>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
