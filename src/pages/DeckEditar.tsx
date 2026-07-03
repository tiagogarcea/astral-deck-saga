import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BY_ID, DECK_SIZE, PER_RANK, cardImg, type CardDef } from "@/game/data";
import { loadSave, saveState } from "@/game/save";
import { CardThumb, RankCounts, PageHead, GameButtonSm, GameModal } from "@/components/game/ui";

const DeckEditar = () => {
  const navigate = useNavigate();
  const s = loadSave();
  const [pick, setPick] = useState<string[]>(s?.deck ?? []);
  const [confirm, setConfirm] = useState<{def:CardDef; action:string; run:()=>void}|null>(null);
  if(!s?.created){ navigate("/login"); return null; }

  const rankCount = (r:number)=>pick.filter(id=>BY_ID[id].rank===r).length;
  const pool = s.owned.filter(id=>!pick.includes(id));

  const addCard = (id:string) => {
    const c = BY_ID[id];
    setConfirm({def:c, action:"Adicionar ao deck", run:()=>{
      if(pick.length>=DECK_SIZE) return toast.error("O deck já tem 20 cartas. Remova uma antes.");
      if(rankCount(c.rank)>=PER_RANK) return toast.error(`Limite de ${PER_RANK} cartas de Rank ${c.rank}.`);
      setPick(p=>[...p, id]);
    }});
  };
  const removeCard = (id:string) => {
    setConfirm({def:BY_ID[id], action:"Remover do deck", run:()=>setPick(p=>p.filter(x=>x!==id))});
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

      {/* 2/3 coleção disponível */}
      <div className="flex-[2] overflow-y-auto p-5 border-b-2 border-gold/40">
        {pool.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
            {pool.map(id=><CardThumb key={id} def={BY_ID[id]} onClick={()=>addCard(id)}/>)}
          </div>
        ) : (
          <p className="text-muted-foreground text-center mt-8">Todas as suas cartas estão no deck.</p>
        )}
      </div>

      {/* 1/3 selecionadas */}
      <div className="flex-1 overflow-y-auto p-4 bg-magic/10 backdrop-blur-sm">
        <h3 className="text-lightning-glow text-xs font-bold tracking-[0.16em] uppercase mb-3">
          Cartas selecionadas ({DECK_SIZE} exatas — {PER_RANK} de cada rank)
        </h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2.5">
          {pick.map(id=>(
            <div key={id} className="animate-in zoom-in-75 duration-300">
              <CardThumb def={BY_ID[id]} onClick={()=>removeCard(id)}/>
            </div>
          ))}
        </div>
      </div>

      {/* zoom + confirmação */}
      <GameModal open={!!confirm} wide>
        {confirm && (
          <div className="flex gap-6 items-center flex-wrap justify-center">
            <img src={cardImg(confirm.def)} alt={confirm.def.name} draggable={false}
              className="w-64 rounded-lg border border-gold/50 shadow-[0_16px_50px_rgba(0,0,0,0.85)]"/>
            <div className="max-w-xs">
              <h3 className="text-2xl font-bold text-gold-light mb-1">{confirm.def.name}</h3>
              <p className="text-lightning-glow text-xs uppercase tracking-widest mb-3">
                {confirm.def.cls} — Rank {confirm.def.rank} — Dano {confirm.def.dmg}
              </p>
              <p className="text-foreground/90 leading-relaxed mb-6">{confirm.def.txt}</p>
              <div className="flex gap-3 flex-wrap">
                <GameButtonSm onClick={()=>{ confirm.run(); setConfirm(null); }}>{confirm.action}</GameButtonSm>
                <GameButtonSm onClick={()=>setConfirm(null)}>Cancelar</GameButtonSm>
              </div>
            </div>
          </div>
        )}
      </GameModal>
    </div>
  );
};

export default DeckEditar;
