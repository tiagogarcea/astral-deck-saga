import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import menuLandscape from "@/assets/menu-landscape.jpg";
import { loadSave, logout, isAuthed } from "@/game/save";
import { XP_TO_LEVEL, MAX_LEVEL } from "@/game/data";
import { AvatarIcon, GameModal, GoldBadge, GameButtonSm } from "@/components/game/ui";

const Menu = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const s = loadSave();

  useEffect(() => {
    setIsVisible(true);
    if(!s?.created){ navigate("/login"); return; }
    if(!isAuthed()){ navigate("/"); return; }
  }, []);

  if(!s?.created) return null;
  const need = XP_TO_LEVEL(s.level);
  const pct = s.level>=MAX_LEVEL ? 100 : Math.min(100, 100*s.xp/need);

  const doLogout = () => { logout(); navigate("/"); };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ backgroundImage: `url(${menuLandscape})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/40" />

      <div className="pointer-events-none absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-magic-glow/20 blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-lightning-glow/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-flame-glow/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className={`absolute top-6 left-6 flex flex-col gap-3 w-72 transition-all duration-700 delay-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={()=>setProfileOpen(true)}
          title="Perfil do jogador">
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
        <GameButtonSm onClick={()=>setFriendsOpen(true)}>Amigos</GameButtonSm>
      </div>

      <div className={`absolute top-6 right-6 transition-all duration-700 delay-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <GoldBadge gold={s.gold}/>
      </div>

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

      {/* Sair (logout) */}
      <GameModal open={exitOpen}>
        <h3 className="text-2xl font-bold text-gold-light text-center mb-2">Deseja sair da conta?</h3>
        <p className="text-muted-foreground text-center mb-6 text-sm">
          Para jogar novamente você precisará entrar com o seu e-mail e senha.
        </p>
        <div className="flex gap-4 justify-center">
          <GameButtonSm danger onClick={doLogout}>Sair</GameButtonSm>
          <GameButtonSm onClick={()=>setExitOpen(false)}>Cancelar</GameButtonSm>
        </div>
      </GameModal>

      {/* Amigos (offline) */}
      <GameModal open={friendsOpen}>
        <h3 className="text-2xl font-bold text-gold-light text-center mb-4">Amigos</h3>
        <div className="space-y-2 mb-6">
          {["Aetheros","MoonRaven","Solthar","Vex_777"].map(n=>(
            <div key={n} className="flex items-center justify-between px-4 py-2 rounded border border-gold/25 bg-black/40">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground shadow-[0_0_8px_currentColor]"/>
                <span className="text-foreground font-bold tracking-wide">{n}</span>
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">offline</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mb-4">
          Convites e partidas on-line chegam com a fase 2 do projeto.
        </p>
        <div className="flex justify-center">
          <GameButtonSm onClick={()=>setFriendsOpen(false)}>Fechar</GameButtonSm>
        </div>
      </GameModal>

      {/* Perfil (avatar + info) */}
      <GameModal open={profileOpen}>
        <h3 className="text-2xl font-bold text-gold-light text-center mb-4">Perfil</h3>
        <div className="flex flex-col items-center gap-3 mb-6">
          <AvatarIcon cls={s.avatar} size={64}/>
          <p className="text-foreground font-bold text-xl">{s.name}</p>
          <p className="text-xs text-muted-foreground">{s.mail}</p>
          <div className="flex gap-6 mt-2 text-sm">
            <span className="text-gold-light">Nível <b>{s.level}</b></span>
            <span className="text-gold-light">Ouro <b>{s.gold}</b></span>
            <span className="text-gold-light">Cartas <b>{s.owned.length}</b></span>
          </div>
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <GameButtonSm onClick={()=>{ setProfileOpen(false); navigate("/perfil"); }}>Trocar avatar</GameButtonSm>
          <GameButtonSm onClick={()=>setProfileOpen(false)}>Fechar</GameButtonSm>
        </div>
      </GameModal>
    </div>
  );
};

export default Menu;
