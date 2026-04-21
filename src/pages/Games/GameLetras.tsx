import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';
import GameOverModal from '../../components/GameOverModal';

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
  LENTO: 0.35,
  NORMAL: 0.5,
  RÁPIDO: 0.6
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
  const [showGameOver, setShowGameOver] = useState(false);

  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastSpawnRef = useRef<number>(0);

  const createNewItem = useCallback((): FallingItem => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return {
      id: Math.random() + Date.now(),
      char: chars.charAt(Math.floor(Math.random() * chars.length)),
      x: Math.floor(Math.random() * 85),
      y: -10,
      speed: selectedSpeed,
      isHit: false
    };
  }, [selectedSpeed]);

  // --- CICLO PRINCIPAL ---
  useEffect(() => {
    if (!gameActive || isPaused) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const update = (time: number) => {
      if (lastSpawnRef.current === 0) lastSpawnRef.current = time;

      setItems(prev => {
        let newItems = [...prev];
        let livesLost = 0;

        newItems = newItems.map(item => {
          if (item.isHit) return item;
          const nextY = item.y + item.speed;
          if (nextY > 105) {
            livesLost++;
            return null;
          }
          return { ...item, y: nextY };
        }).filter((item): item is FallingItem => item !== null);

        if (time - lastSpawnRef.current > SPAWN_RATE) {
          newItems.push(createNewItem());
          lastSpawnRef.current = time;
        }

        if (livesLost > 0) {
          setLives(l => Math.max(0, l - livesLost));
        }

        return newItems;
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameActive, isPaused, createNewItem]);

  // --- TECLADO ---
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

          setTimeout(() => {
            setItems(current => current.filter(i => i.id !== hitItem.id));
          }, 150);

          return newItems;
        }
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, isPaused]);

  // --- CONTROL DE ESTADO DE PERDIDA ---
  useEffect(() => {
    if (lives <= 0 && gameActive) {
      setGameActive(false);
      setShowGameOver(true);
      if (score > highScore) setHighScore(score);
    }
  }, [lives, gameActive, score, highScore]);

  const startGame = () => {
    setScore(0);
    setLives(10);
    setItems([]);
    setGameActive(true);
    setIsPaused(false);
    setFeedback("");
    setShowGameOver(false);
    lastSpawnRef.current = 0;
  };

  const resetToMenu = () => {
    setGameActive(false);
    setIsPaused(false);
    setItems([]);
    setScore(0);
    setFeedback("");
    setShowGameOver(false);
    lastSpawnRef.current = 0;
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased overflow-hidden">

      <GameOverModal
        isOpen={showGameOver}
        title="¡GAME OVER!"
        message={`Puntaje obtenido: ${score} ✨`}
        onRetry={resetToMenu}
        variant="lose"
      />

      <div className="flex-1 w-full px-[5vw] py-[3vw] flex flex-col gap-[2vw]">
        <header className="grid grid-cols-[1.2fr_2fr_1.2fr] gap-[2vw] items-center w-full border-b-[0.2vw] border-slate-200 pb-[2vw]">
          <div className="flex flex-col items-start gap-[1vw]">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[18vw] object-contain" />
          </div>
          <div className="flex flex-col items-center gap-[1vw]">
            <div className="flex gap-[2vw]">
              <div className="text-[3vw] font-black text-[#871F80] leading-none">{score} <span className="text-[1vw] text-slate-400 uppercase">Pts</span></div>
              <div className="text-[3vw] font-black text-red-500 leading-none">{lives} <span className="text-[1vw] text-slate-400 uppercase">Vidas</span></div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-[1vw]">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[25vw] h-auto object-contain" />
            <Link to="/" className="text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-[0.8vw]">← VOLVER AL MENÚ</Link>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-[3vw]">
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
                        className={`w-full py-[0.8vw] rounded-[0.8vw] font-black text-[0.9vw] transition-all border-[0.15vw] ${selectedSpeed === SPEEDS[level]
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

          <section className="col-span-9 relative">
            <div className="bg-slate-900 rounded-[3vw] shadow-2xl border-[0.8vw] border-white h-[35vw] relative overflow-hidden">

              {feedback && (
                <div className="absolute top-[2vw] left-0 right-0 z-[60] flex justify-center pointer-events-none animate-bounce">
                  <span className="text-[4vw] font-black text-emerald-400 drop-shadow-[0_0_1.5vw_rgba(52,211,153,0.7)] uppercase">
                    {feedback}
                  </span>
                </div>
              )}

              {isPaused && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-white text-[4vw] font-black tracking-tighter animate-pulse">PAUSA</div>
                </div>
              )}

              <div className="absolute bottom-[5%] left-0 right-0 h-[20%] bg-gradient-to-t from-[#871F80]/40 to-transparent border-t-[0.3vw] border-dashed border-[#871F80]/50 flex items-center justify-center">
                <span className="text-[#871F80] font-black tracking-[1vw] opacity-30 text-[1.5vw] uppercase">Zona de Acción</span>
              </div>

              {items.map(item => (
                <div
                  key={item.id}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  className={`absolute w-[4vw] h-[4vw] flex items-center justify-center rounded-[0.8vw] font-black text-[2vw] shadow-xl border-b-[0.4vw] transition-[transform,background-color] duration-150
                    ${item.isHit
                      ? 'bg-emerald-500 border-emerald-700 text-white scale-125 z-10'
                      : 'bg-white border-slate-300 text-slate-800'
                    }`}
                >
                  {item.char}
                </div>
              ))}

              {!gameActive && items.length === 0 && !showGameOver && (
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
