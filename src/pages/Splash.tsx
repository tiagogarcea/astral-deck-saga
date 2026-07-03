import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import splashBattle from "@/assets/splash-battle.jpg";
import { loadSave } from "@/game/save";

const Splash = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
        {/* Ornate border overlay */}
        <div className="absolute inset-0 ornate-border pointer-events-none" />
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-end pb-20">
          <button
            onClick={() => navigate(loadSave()?.created ? "/menu" : "/login")}
            className="game-button magical-glow text-gold-light"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default Splash;
