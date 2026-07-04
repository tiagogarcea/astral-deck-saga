import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CARDS, BY_ID, DECK_SIZE, PER_RANK } from "@/game/data";
import { newSave, saveState, login } from "@/game/save";
import { CardThumb, RankCounts, PageHead, GameButtonSm } from "@/components/game/ui";

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"auth"|"nick"|"cards">("auth");
  const [mail, setMail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [name, setName] = useState("");
  const [pick, setPick] = useState<string[]>([]);

  const rankCount = (r:number)=>pick.filter(id=>BY_ID[id].rank===r).length;

  const confirmAuth = () => {
    if(!/^\S+@\S+\.\S+$/.test(mail.trim())) return toast.error("Informe um e-mail válido.");
    if(pass.length<4) return toast.error("Senha deve ter pelo menos 4 caracteres.");
    if(pass!==pass2) return toast.error("As senhas não coincidem.");
    setStep("nick");
  };
  const confirmNick = () => {
    if(!name.trim()) return toast.error("Escolha um nome de jogador.");
    setStep("cards");
  };
  const toggleCard = (id:string) => {
    const c = BY_ID[id];
    if(pick.includes(id)){ setPick(pick.filter(x=>x!==id)); return; }
    if(rankCount(c.rank)>=PER_RANK) return toast.error(`Você já escolheu ${PER_RANK} cartas de Rank ${c.rank}.`);
    setPick([...pick, id]);
  };
  const confirmDeck = () => {
    if(pick.length!==DECK_SIZE) return;
    const s = newSave(name.trim(), mail.trim(), pass);
    s.owned = [...pick]; s.deck = [...pick]; s.created = true;
    saveState(s); login();
    navigate("/menu");
  };

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="ornate-border bg-card/90 backdrop-blur-md rounded-lg p-10 max-w-lg w-full magical-glow">
        {step==="auth" ? (
          <>
            <h2 className="text-3xl font-bold text-gold-light text-center mb-2">Criar conta</h2>
            <p className="text-muted-foreground text-center mb-6 text-sm">
              Passo 1 de 3 — Informe seu e-mail e crie uma senha.
            </p>
            <input value={mail} onChange={e=>setMail(e.target.value)} type="email" placeholder="E-mail"
              className="w-full mb-3 px-4 py-3 rounded bg-input border border-gold/40 text-foreground
                focus:outline-none focus:border-gold-light focus:shadow-[0_0_12px_hsl(var(--gold-light)/0.3)]"/>
            <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Senha"
              className="w-full mb-3 px-4 py-3 rounded bg-input border border-gold/40 text-foreground
                focus:outline-none focus:border-gold-light focus:shadow-[0_0_12px_hsl(var(--gold-light)/0.3)]"/>
            <input value={pass2} onChange={e=>setPass2(e.target.value)} type="password" placeholder="Confirmar senha"
              className="w-full mb-6 px-4 py-3 rounded bg-input border border-gold/40 text-foreground
                focus:outline-none focus:border-gold-light focus:shadow-[0_0_12px_hsl(var(--gold-light)/0.3)]"/>
            <div className="flex flex-col gap-3 items-center">
              <button onClick={confirmAuth} className="game-button text-foreground hover:text-gold-light">Continuar</button>
              <GameButtonSm onClick={()=>navigate("/")}>Voltar</GameButtonSm>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gold-light text-center mb-2">Seu nome</h2>
            <p className="text-muted-foreground text-center mb-6 text-sm">
              Passo 2 de 3 — Como quer ser chamado nas batalhas?
            </p>
            <input value={name} onChange={e=>setName(e.target.value)} maxLength={18} placeholder="Nick"
              onKeyDown={e=>e.key==="Enter" && confirmNick()}
              className="w-full mb-6 px-4 py-3 rounded bg-input border border-gold/40 text-foreground text-center text-lg
                focus:outline-none focus:border-gold-light focus:shadow-[0_0_12px_hsl(var(--gold-light)/0.3)]"/>
            <div className="flex flex-col gap-3 items-center">
              <button onClick={confirmNick} className="game-button text-foreground hover:text-gold-light">Continuar</button>
              <GameButtonSm onClick={()=>setStep("auth")}>Voltar</GameButtonSm>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
