import { useNavigate } from "react-router-dom";
import { loadSave } from "@/game/save";
import { BY_ID, cardImg } from "@/game/data";

const Deck = () => {
  const navigate = useNavigate();
  const s = loadSave();
  if(!s?.created){ navigate("/login"); return null; }
  const fan = s.deck.slice(0,8);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="ornate-border magical-glow bg-gradient-to-b from-card to-[hsl(var(--shadow-deep))] rounded-lg p-10 max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-gold-light text-center mb-8 tracking-wider">Seu Deck</h1>

        {/* leque de cartas */}
        <div className="flex justify-center mb-10 min-h-[150px]">
          {fan.map((id,i)=>(
            <img key={id} src={cardImg(BY_ID[id])} alt={BY_ID[id].name} draggable={false}
              className="w-24 -mx-6 rounded border border-gold/40 shadow-[0_10px_24px_rgba(0,0,0,0.8)]
                transition-transform duration-200 hover:!rotate-0 hover:-translate-y-3 hover:scale-110 hover:z-10 relative"
              style={{transform:`rotate(${(i - fan.length/2 + 0.5)*4}deg)`}}/>
          ))}
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={()=>navigate("/deck/editar")} className="game-button !text-base !px-6 !py-3 text-foreground hover:text-gold-light">
            Editar Deck
          </button>
          <button onClick={()=>navigate("/deck/loja")} className="game-button !text-base !px-6 !py-3 text-foreground hover:text-gold-light">
            Comprar Cartas
          </button>
          <button onClick={()=>navigate("/menu")} className="game-button !text-base !px-6 !py-3 text-foreground hover:text-gold-light">
            Voltar ao Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Deck;
