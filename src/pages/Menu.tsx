import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import menuLandscape from "@/assets/menu-landscape.jpg";
import { loadSave } from "@/game/save";
import { XP_TO_LEVEL, MAX_LEVEL } from "@/game/data";
import { AvatarIcon, GameModal, GoldBadge, GameButtonSm } from "@/components/game/ui";

const Menu = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [onlineOpen, setOnlineOpen] = useState(false);
  const s = loadSave();

  useEffect(() => {
    setIsVisible(true);
    if(!s?.created) navigate("/login");
    // fullscreen (spec: menu em tela cheia)
    document.documentElement.requestFullscreen?.().catch(()=>{});
  }, []);

  if(!s?.created) return null;
  const need = XP_TO_LEVEL(s.level);
  const pct = s.level>=MAX_LEVEL ? 100 : Math.min(100, 100*s.xp/need);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ backgroundImage: `url(${menuLandscape})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* Mystical glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-magic-glow/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-lightning-glow/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-flame-glow/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Placa do jogador: nome + avatar, nível + XP, amigos */}
      <div className={`absolute top-6 left-6 flex flex-col gap-3 w-72 transition-all duration-700 delay-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={()=>navigate("/perfil")}
          title="Trocar imagem de perfil">
          <AvatarIcon cls={s.avatar} size={26}/>
          <span className="text-gold-light font-bold text-lg tracking-wider group-hover:text-foreground transition-colors">
            {s.name}
          </span>
        </div>
        <div className="ornate-border bg-card/80 backdrop-blur-md px-4 py-3 rounded-lg">
          <p className="text-gold-light font-bold tracking-wider text-sm">
            NÍVEL <span className="text-xl ml-1">{s.level}</span>
            <span className="text-muted-foreground font-normal text-xs ml-3">
              {s.level>=MAX_LEVEL ? "MAX" : `${s.xp}/${need} XP`}
            </span>
          </p>
          <div className="mt-2 h-2 rounded-full bg-black/60 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-lightning to-lightning-glow shadow-[0_0_12px_hsl(var(--lightning-glow)/0.8)] transition-all duration-500"
              style={{width:`${pct}%`}}/>
          </div>
        </div>
        <GameButtonSm onClick={()=>setOnlineOpen(true)}>Amigos</GameButtonSm>
      </div>

      {/* Ouro */}
      <div className={`absolute top-6 right-6 transition-all duration-700 delay-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <GoldBadge gold={s.gold}/>
      </div>

      {/* Menu Content */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className={`flex flex-col gap-6 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button onClick={() => navigate("/jogar")} className="game-button text-foreground hover:text-gold-light">
            Jogar
          </button>
          <button onClick={() => navigate("/deck")} className="game-button text-foreground hover:text-gold-light">
            Montar Deck
          </button>
          <button onClick={() => setExitOpen(true)} className="game-button text-foreground hover:text-gold-light">
            Sair
          </button>
        </div>
      </div>

      {/* Tela 3.1: prévia da saída */}
      <GameModal open={exitOpen}>
        <h3 className="text-2xl font-bold text-gold-light text-center mb-6">Deseja sair do jogo?</h3>
        <div className="flex gap-4 justify-center">
          <GameButtonSm danger onClick={()=>{ window.close(); navigate("/"); }}>Sim</GameButtonSm>
          <GameButtonSm onClick={()=>setExitOpen(false)}>Não</GameButtonSm>
        </div>
      </GameModal>

      {/* Amigos / online: fase 2 */}
      <GameModal open={onlineOpen}>
        <h3 className="text-2xl font-bold text-gold-light text-center mb-4">Recurso on-line</h3>
        <p className="text-muted-foreground text-center mb-6 leading-relaxed">
          Lista de amigos, chat, convites e partidas on-line precisam de um servidor.
          Esta versão roda 100% no seu navegador — a fase 2 do projeto vai habilitar tudo isso.
        </p>
        <div className="flex justify-center">
          <GameButtonSm onClick={()=>setOnlineOpen(false)}>Entendi</GameButtonSm>
        </div>
      </GameModal>
    </div>
  );
};

export default Menu;
