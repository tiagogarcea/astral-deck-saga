import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CARDS, CARD_PRICE, cardImg, type CardDef } from "@/game/data";
import { loadSave, saveState, type SaveState } from "@/game/save";
import { CardThumb, PageHead, GameButtonSm, GameModal, GoldBadge, MysticBG } from "@/components/game/ui";

const Loja = () => {
  const navigate = useNavigate();
  const [s, setS] = useState<SaveState|null>(loadSave());
  const [zoom, setZoom] = useState<CardDef|null>(null);
  const [buying, setBuying] = useState<CardDef|null>(null);
  if(!s?.created){ navigate("/login"); return null; }

  const startBuy = (def:CardDef) => {
    if(s.gold < CARD_PRICE(def.rank)) return toast.error("Ouro insuficiente.");
    setBuying(def);
  };
  const confirmBuy = () => {
    if(!buying) return;
    const price = CARD_PRICE(buying.rank);
    const ns = {...s, gold:s.gold-price, owned:[...s.owned, buying.id]};
    saveState(ns); setS(ns);
    toast.success(`${buying.name} agora faz parte da sua coleção!`);
    setBuying(null); setZoom(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <MysticBG tint="amber" />

      <PageHead title="Loja de cartas">
        <GoldBadge gold={s.gold}/>
        <GameButtonSm onClick={()=>navigate("/deck")}>Voltar</GameButtonSm>
      </PageHead>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
          {CARDS.map(c=>{
            const owned = s.owned.includes(c.id);
            return <CardThumb key={c.id} def={c} dim={owned} ownedTag={owned} price={!owned}
              onClick={()=>setZoom(c)}/>;
          })}
        </div>
      </div>

      {/* zoom centralizado com botão comprar */}
      <GameModal open={!!zoom} wide>
        {zoom && (
          <div className="flex gap-6 items-center flex-wrap justify-center">
            <img src={cardImg(zoom)} alt={zoom.name} draggable={false}
              className="w-72 rounded-lg border border-gold/50 magical-glow"/>
            <div className="max-w-xs">
              <h3 className="text-2xl font-bold text-gold-light mb-1">{zoom.name}</h3>
              <p className="text-lightning-glow text-xs uppercase tracking-widest mb-3">
                {zoom.cls} — Rank {zoom.rank} — Dano {zoom.dmg}
              </p>
              <p className="text-foreground/90 leading-relaxed mb-6">{zoom.txt}</p>
              <div className="flex gap-3 flex-wrap">
                {s.owned.includes(zoom.id)
                  ? <span className="text-green-400 font-bold self-center">Já está na sua coleção ✓</span>
                  : <GameButtonSm onClick={()=>startBuy(zoom)}>Comprar por {CARD_PRICE(zoom.rank)} ouro</GameButtonSm>}
                <GameButtonSm onClick={()=>setZoom(null)}>Fechar</GameButtonSm>
              </div>
            </div>
          </div>
        )}
      </GameModal>

      {/* confirmação de compra (segundo passo) */}
      <GameModal open={!!buying}>
        {buying && (
          <>
            <h3 className="text-2xl font-bold text-gold-light text-center mb-4">Confirmar compra</h3>
            <p className="text-muted-foreground text-center mb-6">
              Confirmar a compra de <b className="text-foreground">{buying.name}</b> por{" "}
              <b className="text-gold-light">{CARD_PRICE(buying.rank)} de ouro</b>?
            </p>
            <div className="flex gap-3 justify-center">
              <GameButtonSm onClick={confirmBuy}>Confirmar compra</GameButtonSm>
              <GameButtonSm onClick={()=>setBuying(null)}>Cancelar</GameButtonSm>
            </div>
          </>
        )}
      </GameModal>
    </div>
  );
};

export default Loja;
