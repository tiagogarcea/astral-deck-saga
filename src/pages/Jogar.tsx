import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameModal, GameButtonSm, MysticBG } from "@/components/game/ui";


const Jogar = () => {
  const navigate = useNavigate();
  const [onlineOpen, setOnlineOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      <MysticBG tint="purple" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-magic-glow/15 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-flame-glow/15 blur-[120px] animate-pulse pointer-events-none" style={{animationDelay:'1.2s'}} />


      <div className="relative flex flex-col gap-6 items-center">
        <h1 className="text-4xl font-bold text-gold-light tracking-wider mb-4">Modos de Jogo</h1>
        <button onClick={()=>navigate("/jogar/historia")} className="game-button w-80 text-foreground hover:text-gold-light">
          Modo História
        </button>
        <button onClick={()=>navigate("/jogar/bot")} className="game-button w-80 text-foreground hover:text-gold-light">
          Versus BOT
        </button>
        <button onClick={()=>setOnlineOpen(true)} className="game-button w-80 text-foreground hover:text-gold-light">
          Random On-line
        </button>
        <button onClick={()=>setOnlineOpen(true)} className="game-button w-80 text-foreground hover:text-gold-light">
          Versus Amigo
        </button>
        <GameButtonSm onClick={()=>navigate("/menu")}>Voltar ao menu</GameButtonSm>
      </div>

      <GameModal open={onlineOpen}>
        <h3 className="text-2xl font-bold text-gold-light text-center mb-4">Recurso on-line</h3>
        <p className="text-muted-foreground text-center mb-6 leading-relaxed">
          Partidas on-line e duelos contra amigos precisam de um servidor.
          Esta versão roda 100% no seu navegador — a fase 2 do projeto vai habilitar tudo isso.
        </p>
        <div className="flex justify-center">
          <GameButtonSm onClick={()=>setOnlineOpen(false)}>Entendi</GameButtonSm>
        </div>
      </GameModal>
    </div>
  );
};

export default Jogar;
