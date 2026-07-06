import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import splashBattle from "@/assets/splash-battle.jpg";
import { isAuthed, tryLogin as doLogin } from "@/game/save";

const Splash = () => {
  const navigate = useNavigate();
  const [mail, setMail] = useState("");
  const [pass, setPass] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(()=>{
    setIsLoaded(true);
    if(isAuthed()) navigate("/menu");
  }, []);

  const tryLogin = () => {
    if(!mail.trim() || !pass) return toast.error("Preencha e-mail e senha.");
    const acc = doLogin(mail.trim(), pass);
    if(!acc) return toast.error("E-mail ou senha incorretos.");
    navigate("/menu");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[hsl(var(--shadow-deep))] p-4">
      <div
        className={`relative w-[650px] h-[650px] rounded-lg overflow-hidden transition-all duration-1000 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          backgroundImage: `url(${splashBattle})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 ornate-border pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/85" />

        <div className="relative h-full flex flex-col items-center justify-center px-10 gap-4">
          <h1 className="text-4xl font-bold text-gold-light tracking-widest mb-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            ARCANUM
          </h1>
          <input
            value={mail} onChange={e=>setMail(e.target.value)} type="email" placeholder="E-mail"
            className="w-72 px-4 py-3 rounded bg-black/60 border-2 border-gold/50 text-foreground text-center
              focus:outline-none focus:border-gold-light focus:shadow-[0_0_16px_hsl(var(--gold-light)/0.4)]"/>
          <input
            value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Senha"
            onKeyDown={e=>e.key==="Enter" && tryLogin()}
            className="w-72 px-4 py-3 rounded bg-black/60 border-2 border-gold/50 text-foreground text-center
              focus:outline-none focus:border-gold-light focus:shadow-[0_0_16px_hsl(var(--gold-light)/0.4)]"/>
          <button onClick={tryLogin} className="game-button magical-glow text-gold-light mt-2">
            Entrar
          </button>
          <button
            onClick={()=>navigate("/login")}
            className="mt-2 text-sm uppercase tracking-widest text-lightning-glow hover:text-gold-light transition-colors underline-offset-4 hover:underline"
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Splash;
