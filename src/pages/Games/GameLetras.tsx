import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';

// --- INTERFACES ---
interface FallingItem {
  id: number;
  char: string;
  x: number;
  y: number;
  speed: number;
  isHit?: boolean;
}

const SPEEDS = {
  LENTO: 0.1,
  NORMAL: 0.2,
  RÁPIDO: 0.35
};

const SPAWN_RATE = 1500; 
const HIT_ZONE_MIN = 75;
const HIT_ZONE_MAX = 95;

export default function GameLetras() {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [selectedSpeed, setSelectedSpeed] = useState<number>(SPEEDS.NORMAL);
  const [feedback, setFeedback] = useState("");

  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastSpawnRef = useRef<number>(0);

  // --- LÓGICA DE JUEGO (Se mantiene igual) ---
  const spawnItem = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const newItem: FallingItem = {
      id: Date.now() + Math.random(),
      char: chars.charAt(Math.floor(Math.random() * chars.length)),
      x: Math.floor(Math.random() * 85), 
      y: -10,
      speed: selectedSpeed,
      isHit: false
    };
    setItems(prev => [...prev, newItem]);
  }, [selectedSpeed]);

  useEffect(() => {
    if (!gameActive || isPaused) return;
    const update = (time: number) => {
      if (time - lastSpawnRef.current > SPAWN_RATE) {
        spawnItem();
        lastSpawnRef.current = time;
      }
      setItems(prev => {
        const newItems: FallingItem[] = [];
        let livesLost = 0;
        for (const item of prev) {
          if (item.isHit) { newItems.push(item); continue; }
          const nextY = item.y + item.speed; 
          if (nextY > 100) { livesLost++; } 
          else { newItems.push({ ...item, y: nextY }); }
        }
        if (livesLost > 0) setLives(l => Math.max(0, l - livesLost));
        return newItems;
      });
      gameLoopRef.current = requestAnimationFrame(update);
    };
    gameLoopRef.current = requestAnimationFrame(update);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameActive, isPaused, spawnItem]);

  useEffect(() => {
    const messages = ["¡MUY BIEN!", "¡OK!", "¡GENIAL!", "¡EXCELENTE!", "¡BUENA!"];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive || isPaused) return; 
      const key = e.key.toUpperCase();
      setItems(prev => {
        const targetIndex = prev.findIndex(item => 
          item.char === key && item.y >= HIT_ZONE_MIN && item.y <= HIT_ZONE_MAX && !item.isHit
        );
        if (targetIndex !== -1) {
          setFeedback(messages[Math.floor(Math.random() * messages.length)]);
          setTimeout(() => setFeedback(""), 800);
          setScore(s => s + 10);
          const newItems = [...prev];
          const hitItem = { ...newItems[targetIndex], isHit: true };
          newItems[targetIndex] = hitItem;
          setTimeout(() => { setItems(current => current.filter(i => i.id !== hitItem.id)); }, 150);
          return newItems;
        }
        return prev;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, isPaused]);

  useEffect(() => {
    if (lives <= 0 && gameActive) {
      setGameActive(false);
      if (score > highScore) setHighScore(score);
    }
  }, [lives, gameActive, score, highScore]);

  const startGame = () => { setScore(0); setLives(10); setItems([]); setGameActive(true); setIsPaused(false); setFeedback(""); };
  const resetToMenu = () => { setGameActive(false); setIsPaused(false); setItems([]); setScore(0); setFeedback(""); };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased overflow-hidden">
      
      {/* MODAL GAME OVER ESCALABLE */}
      {lives <= 0 && !gameActive && score > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-[2vw] bg-slate-900/40 backdrop-blur-md">
          <div className="relative p-[5vw] rounded-[4vw] shadow-2xl text-center max-w-[50vw] w-full border-[0.4vw] bg-red-500 border-red-300 shadow-red-500/50">
            <h2 className="text-[5vw] font-black text-white uppercase mb-[1vw] tracking-tighter leading-none">¡FIN DEL JUEGO!</h2>
            <p className="text-white/90 text-[2vw] font-bold mb-[3vw] uppercase">Puntaje final: {score} ✨</p>
            <button onClick={resetToMenu} className="bg-white text-slate-900 px-[4vw] py-[1.5vw] rounded-[1.5vw] font-black text-[1.5vw] hover:scale-105 active:scale-95 transition-transform shadow-lg">
              VOLVER A SELECCIÓN
            </button>
          </div>
        </div>
      )}

      {/* Header Escalable */}
      <div className="flex-1 w-full px-[5vw] py-[3vw] flex flex-col gap-[2vw]">
        <header className="grid grid-cols-[1.2fr_2fr_1.2fr] gap-[2vw] items-center w-full border-b-[0.2vw] border-slate-200 pb-[2vw]">
          <div className="flex flex-col items-start gap-[1vw]">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[18vw] object-contain" />
            <div className="flex gap-[2vw]">
                <div className="text-[3vw] font-black text-[#871F80] leading-none">{score} <span className="text-[1vw] text-slate-400 uppercase">Pts</span></div>
                <div className="text-[3vw] font-black text-red-500 leading-none">{lives} <span className="text-[1vw] text-slate-400 uppercase">Vidas</span></div>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[25vw] h-auto object-contain" />
          </div>
          <div className="flex flex-col items-end">
             <Link to="/" className="text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-[0.8vw]">← VOLVER AL MENÚ</Link>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-[3vw]">
          
          {/* ASIDE ESCALABLE */}
          <aside className="col-span-3 space-y-[2vw]">
            <div className="bg-white/80 backdrop-blur-sm rounded-[2vw] p-[2vw] border border-white shadow-xl">
              <h3 className="text-[0.7vw] font-black text-slate-400 mb-[1vw] uppercase tracking-[0.3em]">Record</h3>
              <div className="text-[2.5vw] font-black text-slate-800 tracking-tighter leading-none">{highScore.toLocaleString()}</div>
            </div>

            <div className="bg-[#871F80] rounded-[2vw] p-[2vw] text-white shadow-2xl">
              <h3 className="text-[0.7vw] font-black text-white/60 mb-[1vw] uppercase tracking-[0.3em]">Controles</h3>
              
              {!gameActive ? (
                <>
                  <p className="font-bold text-[0.9vw] leading-relaxed mb-[1.5vw]">Velocidad:</p>
                  <div className="space-y-[0.8vw] mb-[1.5vw]">
                    {(Object.keys(SPEEDS) as Array<keyof typeof SPEEDS>).map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedSpeed(SPEEDS[level])}
                        className={`w-full py-[0.8vw] rounded-[0.8vw] font-black text-[0.9vw] transition-all border-[0.15vw] ${
                          selectedSpeed === SPEEDS[level] 
                          ? 'bg-white text-[#871F80] border-white scale-105 shadow-lg' 
                          : 'bg-transparent text-white border-white/30 hover:bg-white/10'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <button onClick={startGame} className="w-full bg-emerald-500 text-white py-[1.2vw] rounded-[0.8vw] font-black text-[1vw] hover:bg-emerald-400 transition-all shadow-lg">
                    ¡EMPEZAR!
                  </button>
                </>
              ) : (
                <div className="space-y-[1vw]">
                  <button 
                    onClick={() => setIsPaused(!isPaused)} 
                    className={`w-full py-[1.2vw] rounded-[0.8vw] font-black text-[1vw] transition-all shadow-lg ${isPaused ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                  >
                    {isPaused ? 'REANUDAR' : 'PAUSAR'}
                  </button>
                  <button onClick={resetToMenu} className="w-full bg-red-500 text-white py-[1.2vw] rounded-[0.8vw] font-black text-[1vw] hover:bg-red-600 transition-all shadow-lg">
                    SALIR
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* ÁREA DE JUEGO ESCALABLE */}
          <section className="col-span-9 relative">
            <div className="bg-slate-900 rounded-[3vw] shadow-2xl border-[0.8vw] border-white h-[35vw] relative overflow-hidden">
              
              {/* Overlay de Feedback */}
              {feedback && (
                <div className="absolute top-[2vw] left-0 right-0 z-[60] flex justify-center pointer-events-none animate-bounce">
                  <span className="text-[4vw] font-black text-emerald-400 drop-shadow-[0_0_1.5vw_rgba(52,211,153,0.7)] uppercase">
                    {feedback}
                  </span>
                </div>
              )}

              {/* Overlay de Pausa */}
              {isPaused && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-white text-[4vw] font-black tracking-tighter animate-pulse">PAUSA</div>
                </div>
              )}

              {/* Zona de Acción */}
              <div className="absolute bottom-[5%] left-0 right-0 h-[20%] bg-gradient-to-t from-[#871F80]/40 to-transparent border-t-[0.3vw] border-dashed border-[#871F80]/50 flex items-center justify-center">
                <span className="text-[#871F80] font-black tracking-[1vw] opacity-30 text-[1.5vw] uppercase">Zona de Acción</span>
              </div>

              {/* Ítems (Letras) escalables */}
              {items.map(item => (
                <div
                  key={item.id}
                  style={{ left: `${item.x}%`, top: `${item.y}%`, transition: 'top 0.05s linear' }}
                  className={`absolute w-[4vw] h-[4vw] flex items-center justify-center rounded-[0.8vw] font-black text-[2vw] shadow-xl border-b-[0.4vw] transition-all
                    ${item.isHit 
                      ? 'bg-emerald-500 border-emerald-700 text-white scale-125 z-10' 
                      : 'bg-white border-slate-300 text-slate-800'
                    }`}
                >
                  {item.char}
                </div>
              ))}

              {!gameActive && items.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-[2vw] bg-slate-900/60 backdrop-blur-sm">
                   <div className="bg-white p-[3vw] rounded-[2vw] shadow-2xl">
                     <p className="text-[#871F80] font-black text-[2vw] mb-[0.5vw] uppercase">Configura tu nivel</p>
                     <p className="text-slate-400 font-bold text-[1vw]">Elige la velocidad para comenzar</p>
                   </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}