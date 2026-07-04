import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BY_ID, DECK_SIZE, PER_RANK, cardImg, type CardDef } from "@/game/data";
import { loadSave, saveState } from "@/game/save";
import { CardThumb, RankCounts, PageHead, GameButtonSm, CardPreview } from "@/components/game/ui";

const DeckEditar = () => {
  const navigate = useNavigate();
  const s = loadSave();
  const [pick, setPick] = useState<string[]>(s?.deck ?? []);
  const [preview, setPreview] = useState<CardDef|null>(null);
  if(!s?.created){ navigate("/login"); return null; }

  const rankCount = (r:number)=>pick.filter(id=>BY_ID[id].rank===r).length;
  const pool = s.owned;

  const toggle = (id:string) => {
    if(pick.includes(id)){
      setPick(p=>p.filter(x=>x!==id));
      return;
    }
    const c = BY_ID[id];
    if(pick.length>=DECK_SIZE) return toast.error("O deck já tem 20 cartas. Clique numa selecionada para removê-la.");
    if(rankCount(c.rank)>=PER_RANK) return toast.error(`Limite de ${PER_RANK} cartas de Rank ${c.rank}.`);
    setPick(p=>[...p, id]);
  };

  const save = () => {
    if(pick.length!==DECK_SIZE) return;
    s.deck = [...pick]; saveState(s);
    toast.success("Deck salvo!");
    navigate("/deck");
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <PageHead title="Editar deck">
        <RankCounts ids={pick}/>
        <GameButtonSm disabled={pick.length!==DECK_SIZE} onClick={save}>Salvar</GameButtonSm>
        <GameButtonSm onClick={()=>navigate("/deck")}>Voltar</GameButtonSm>
      </PageHead>

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">
          Toque numa carta para selecionar / retirar do deck. Passe o mouse para ver ampliada.
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 pt-3">
          {pool.map(id=>(
            <div key={id} onMouseEnter={()=>setPreview(BY_ID[id])} onMouseLeave={()=>setPreview(null)}>
              <CardThumb
                def={BY_ID[id]}
                selected={pick.includes(id)}
                onClick={()=>toggle(id)}
              />
            </div>
          ))}
        </div>
      </div>

      <CardPreview def={preview}/>
    </div>
  );
};

export default DeckEditar;
