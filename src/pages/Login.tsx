import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CARDS, BY_ID, DECK_SIZE, PER_RANK, CLASSES } from "@/game/data";
import { loadSave, newSave, saveState } from "@/game/save";
import { AvatarIcon, CardThumb, RankCounts, PageHead, GameButtonSm } from "@/components/game/ui";

const Login = () => {
  const navigate = useNavigate();
  const existing = loadSave();
  const [step, setStep] = useState<"login"|"first"|"cards">(existing?.created ? "login" : "first");
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [avatar, setAvatar] = useState<string|null>(null);
  const [pick, setPick] = useState<string[]>([]);

  const rankCount = (r:number)=>pick.filter(id=>BY_ID[id].rank===r).length;

  const confirmFirst = () => {
    if(!name.trim()) return toast.error("Escolha um nome de jogador.");
    if(!avatar) return toast.error("Escolha uma silhueta de perfil.");
    setStep("cards");
  };

  const toggleCard = (id:string) => {
    const c = BY_ID[id];
    if(pick.includes(id)) setPick(pick.filter(x=>x!==id));
    else{
      if(rankCount(c.rank)>=PER_RANK) return toast.error(`Você já escolheu ${PER_RANK} cartas de Rank ${c.rank}.`);
      setPick([...pick, id]);
    }
  };

  const confirmDeck = () => {
    if(pick.length!==DECK_SIZE) return;
    const s = newSave(name.trim(), mail.trim(), avatar!);
    s.owned = [...pick]; s.deck = [...pick]; s.created = true;
    saveState(s);
    navigate("/menu");
  };

  // ---- passo: escolha das 20 cartas ----
  if(step==="cards") return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHead title="Monte seu deck inicial">
        <RankCounts ids={pick}/>
        <GameButtonSm disabled={pick.length!==DECK_SIZE} onClick={confirmDeck}>Confirmar deck</GameButtonSm>
      </PageHead>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
          {CARDS.map(c=>(
            <CardThumb key={c.id} def={c}
              selected={pick.includes(c.id)}
              dim={!pick.includes(c.id) && rankCount(c.rank)>=PER_RANK}
              onClick={()=>toggleCard(c.id)}/>
          ))}
        </div>
      </div>
    </div>
  );

  // ---- passo: login / primeiro login ----
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="ornate-border bg-card/90 backdrop-blur-md rounded-lg p-10 max-w-lg w-full magical-glow">
        {step==="login" ? (
          <>
            <h2 className="text-3xl font-bold text-gold-light text-center mb-2">Bem-vindo de volta</h2>
            <p className="text-muted-foreground text-center mb-8">
              {existing?.name}, sua conta está salva neste navegador.
            </p>
            <div className="flex flex-col gap-4 items-center">
              <button onClick={()=>navigate("/menu")} className="game-button text-foreground hover:text-gold-light">
                Entrar
              </button>
              <GameButtonSm onClick={()=>setStep("first")}>Criar nova conta</GameButtonSm>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gold-light text-center mb-2">Primeiro Login</h2>
            <p className="text-muted-foreground text-center mb-6 text-sm">
              Escolha seu nome, vincule um e-mail e escolha sua silhueta de perfil.
            </p>
            <input value={name} onChange={e=>setName(e.target.value)} maxLength={18}
              placeholder="Nome do jogador"
              className="w-full mb-3 px-4 py-3 rounded bg-input border border-gold/40 text-foreground
                focus:outline-none focus:border-gold-light focus:shadow-[0_0_12px_hsl(var(--gold-light)/0.3)]"/>
            <input value={mail} onChange={e=>setMail(e.target.value)} type="email"
              placeholder="E-mail (Gmail ou Microsoft)"
              className="w-full mb-5 px-4 py-3 rounded bg-input border border-gold/40 text-foreground
                focus:outline-none focus:border-gold-light focus:shadow-[0_0_12px_hsl(var(--gold-light)/0.3)]"/>
            <div className="flex gap-4 justify-center flex-wrap mb-8">
              {CLASSES.map(cls=>(
                <div key={cls} className="flex flex-col items-center gap-1.5">
                  <AvatarIcon cls={cls} selected={avatar===cls} onClick={()=>setAvatar(cls)}/>
                  <span className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">{cls}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 items-center">
              <button onClick={confirmFirst} className="game-button text-foreground hover:text-gold-light">
                Confirmar
              </button>
              {existing?.created && <GameButtonSm onClick={()=>setStep("login")}>Já tenho conta</GameButtonSm>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
