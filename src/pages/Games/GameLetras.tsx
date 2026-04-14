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
}

// Opciones de dificultad
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
  const [highScore, setHighScore] = useState(0);
  
  // Nuevo estado para la velocidad seleccionada
  const [selectedSpeed, setSelectedSpeed] = useState<number>(SPEEDS.NORMAL);

  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastSpawnRef = useRef<number>(0);

  // --- LÓGICA DE JUEGO ---

  const spawnItem = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const newItem: FallingItem = {
      id: Date.now() + Math.random(),
      char: chars.charAt(Math.floor(Math.random() * chars.length)),
      x: Math.floor(Math.random() * 85), 
      y: -10,
      speed: selectedSpeed, // Velocidad fija seleccionada
    };
    setItems(prev => [...prev, newItem]);
  }, [selectedSpeed]);

  useEffect(() => {
    if (!gameActive) return;

    const update = (time: number) => {
      // Spawn constante
      if (time - lastSpawnRef.current > SPAWN_RATE) {
        spawnItem();
        lastSpawnRef.current = time;
      }

      setItems(prev => {
        const newItems: FallingItem[] = [];
        let livesLost = 0;

        for (const item of prev) {
          const nextY = item.y + item.speed; 
          
          if (nextY > 100) {
            livesLost++; 
          } else {
            newItems.push({ ...item, y: nextY });
          }
        }

        if (livesLost > 0) setLives(l => Math.max(0, l - livesLost));
        return newItems;
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameActive, spawnItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive) return;
      const key = e.key.toUpperCase();

      setItems(prev => {
        const targetIndex = prev.findIndex(item => 
          item.char === key && item.y >= HIT_ZONE_MIN && item.y <= HIT_ZONE_MAX
        );

        if (targetIndex !== -1) {
          setScore(s => s + 10);
          const newItems = [...prev];
          newItems.splice(targetIndex, 1);
          return newItems;
        }
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive]);

  useEffect(() => {
    if (lives <= 0 && gameActive) {
      setGameActive(false);
      if (score > highScore) setHighScore(score);
    }
  }, [lives, gameActive, score, highScore]);

  const startGame = () => {
    setScore(0);
    setLives(10);
    setItems([]);
    setGameActive(true);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased overflow-hidden">
      
      {/* MODAL GAME OVER */}
      {lives <= 0 && !gameActive && score > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className="relative p-10 lg:p-16 rounded-[3rem] shadow-2xl text-center max-w-2xl w-full border-4 animate-in zoom-in duration-300 bg-red-500 border-red-300 shadow-red-500/50">
            <h2 className="text-4xl lg:text-7xl font-black text-white uppercase mb-4 tracking-tighter">¡FIN DEL JUEGO!</h2>
            <p className="text-white/90 text-xl lg:text-2xl font-bold mb-8 uppercase">Puntaje final: {score} ✨</p>
            <button onClick={startGame} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-transform shadow-lg">REINTENTAR</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-1 w-full px-6 sm:px-12 lg:px-20 py-10 flex flex-col gap-8">
        <header className="grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.2fr] gap-8 items-center w-full">
          <div className="flex flex-col items-start gap-2">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[380px] lg:w-[420px] object-contain" />
            <div className="flex gap-6">
                <div className="text-5xl font-black text-[#871F80]">{score} <span className="text-xl text-slate-400 uppercase">Pts</span></div>
                <div className="text-5xl font-black text-red-500">{lives} <span className="text-xl text-slate-400 uppercase">Vidas</span></div>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[70vw] sm:w-[45vw] lg:w-[28vw] max-w-[800px] h-auto object-contain" />
          </div>
          <div className="flex flex-col items-center sm:items-end">
             <Link to="/" className="group text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-xs">← VOLVER AL MENÚ</Link>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white shadow-xl">
              <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.3em]">Record</h3>
              <div className="text-4xl font-black text-slate-800 tracking-tighter">{highScore.toLocaleString()}</div>
            </div>

            <div className="bg-[#871F80] rounded-[2.5rem] p-8 text-white shadow-2xl">
              <h3 className="text-xs font-black text-white/60 mb-4 uppercase tracking-[0.3em]">Instrucciones</h3>
              <p className="font-bold text-sm leading-relaxed mb-6">
                Selecciona una dificultad y presiona las teclas en la zona purpúrea.
              </p>

              {/* SELECTOR DE VELOCIDAD */}
              {!gameActive && (
                <div className="space-y-3 mb-6">
                  {(Object.keys(SPEEDS) as Array<keyof typeof SPEEDS>).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedSpeed(SPEEDS[level])}
                      className={`w-full py-3 rounded-xl font-black text-sm transition-all border-2 ${
                        selectedSpeed === SPEEDS[level] 
                        ? 'bg-white text-[#871F80] border-white scale-105 shadow-lg' 
                        : 'bg-transparent text-white border-white/30 hover:bg-white/10'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}

              {!gameActive && (
                <button onClick={startGame} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black hover:bg-emerald-400 transition-all shadow-lg active:scale-95">
                  ¡EMPEZAR AHORA!
                </button>
              )}
            </div>
          </aside>

          <section className="lg:col-span-9 relative">
            <div className="bg-slate-900 rounded-[3.5rem] shadow-2xl border-[12px] border-white h-[650px] relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-6 opacity-5 pointer-events-none">
                {[...Array(6)].map((_, i) => <div key={i} className="border-r border-white h-full" />)}
              </div>

              <div className="absolute bottom-[5%] left-0 right-0 h-[20%] bg-gradient-to-t from-[#871F80]/40 to-transparent border-t-4 border-dashed border-[#871F80]/50 flex items-center justify-center">
                <span className="text-[#871F80] font-black tracking-[1em] opacity-30 text-2xl uppercase">Zona de Acción</span>
              </div>

              {items.map(item => (
                <div
                  key={item.id}
                  style={{ left: `${item.x}%`, top: `${item.y}%`, transition: 'none' }}
                  className={`absolute w-16 h-16 flex items-center justify-center rounded-2xl font-black text-3xl shadow-xl border-b-4
                    ${item.y > HIT_ZONE_MIN ? 'bg-emerald-500 border-emerald-700 text-white animate-pulse' : 'bg-white border-slate-300 text-slate-800'}`}
                >
                  {item.char}
                </div>
              ))}

              {!gameActive && items.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 bg-slate-900/60 backdrop-blur-sm">
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl">
                     <p className="text-[#871F80] font-black text-3xl mb-2 uppercase">Configura tu nivel</p>
                     <p className="text-slate-400 font-bold">Elige una velocidad en el menú lateral</p>
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