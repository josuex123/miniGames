import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';
import GameOverModal from '../../components/GameOverModal';

// --- CONFIGURACIÓN ---
const ROAD_WIDTH = 350;
const CAR_WIDTH = 60;
const CAR_HEIGHT = 100;
const ENEMY_SPEED_BASE = 4;
const SPAWN_INTERVAL_BASE = 90;
const MAX_ENEMIES = 3;
const MIN_VERTICAL_DISTANCE = CAR_HEIGHT + 60;
const LANES = [-100, -35, 30, 95];

export default function GameCars() {
  const [gameStarted, setGameStarted] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [carX, setCarX] = useState(0);
  const [enemies, setEnemies] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const carXRef = useRef(0);
  const isGameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const spawnCounterRef = useRef(0);

  useEffect(() => { carXRef.current = carX; }, [carX]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const moveLeft = () => {
    if (!isGameOverRef.current && gameStarted) {
      setCarX((prev) => Math.max(prev - 35, -ROAD_WIDTH / 2 + CAR_WIDTH / 2));
    }
  };

  const moveRight = () => {
    if (!isGameOverRef.current && gameStarted) {
      setCarX((prev) => Math.min(prev + 35, ROAD_WIDTH / 2 - CAR_WIDTH / 2));
    }
  };

  useEffect(() => {
    if (!gameStarted || isGameOver) return;

    const interval = setInterval(() => {
      spawnCounterRef.current++;
      
      setEnemies((prevEnemies) => {
        const currentEnemySpeed = ENEMY_SPEED_BASE + Math.min(scoreRef.current / 20, 8);
        let movedEnemies = prevEnemies.map((e) => ({ ...e, y: e.y + currentEnemySpeed }));

        movedEnemies = movedEnemies.filter((e) => {
          if (e.y > 650) {
            setScore((s) => {
              const newScore = s + 1;
              scoreRef.current = newScore;
              setSpeed((sp) => Math.min(sp + 2, 280));
              return newScore;
            });
            return false;
          }
          return true;
        });

        const spawnInterval = Math.max(SPAWN_INTERVAL_BASE - scoreRef.current * 2, 40);
        
        if (movedEnemies.length < MAX_ENEMIES && spawnCounterRef.current >= spawnInterval) {
          spawnCounterRef.current = 0;
          const occupiedLanes = movedEnemies
            .filter((e) => e.y < MIN_VERTICAL_DISTANCE)
            .map((e) => LANES.findIndex((lane) => Math.abs(lane - e.x) < CAR_WIDTH));
          
          const availableLanes = LANES
            .map((lane, index) => ({ lane, index }))
            .filter(({ index }) => !occupiedLanes.includes(index));
          
          if (availableLanes.length > 0) {
            const randomLane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
            movedEnemies.push({
              id: Date.now() + Math.random(),
              x: randomLane.lane,
              y: -CAR_HEIGHT - 20,
            });
          }
        }

        for (const enemy of movedEnemies) {
          const playerTop = 600 - CAR_HEIGHT - 48;
          const playerBottom = 600 - 48;
          const playerLeft = carXRef.current - CAR_WIDTH / 2;
          const playerRight = carXRef.current + CAR_WIDTH / 2;
          const margin = 10;

          if (
            enemy.y + CAR_HEIGHT > playerTop + margin && 
            enemy.y < playerBottom - margin &&
            enemy.x + CAR_WIDTH / 2 > playerLeft + margin && 
            enemy.x - CAR_WIDTH / 2 < playerRight - margin
          ) {
            setIsGameOver(true);
            isGameOverRef.current = true;
            setSpeed(0);
            return movedEnemies;
          }
        }
        return movedEnemies;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameStarted, isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); moveLeft(); }
      if (e.key === "ArrowRight") { e.preventDefault(); moveRight(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, isGameOver]);

  const handleAction = () => {
    if (isGameOver) {
      setCarX(0);
      setEnemies([]);
      setIsGameOver(false);
      isGameOverRef.current = false;
      setScore(0);
      scoreRef.current = 0;
      setSpeed(0);
      setGameStarted(false); 
    } else {
      setGameStarted(!gameStarted);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased overflow-hidden">
      
      <GameOverModal
        isOpen={isGameOver}
        title="¡SYSTEM FAILURE!"
        message={`Score Final: ${score}`}
        onRetry={handleAction}
        variant="lose"
      />

      {/* HEADER ESCALABLE */}
      <header className="w-full px-[5vw] py-[2.5vw] grid grid-cols-[1.2fr_2fr_1.2fr] gap-[2vw] items-center z-10 border-b-[0.2vw] border-slate-200 pb-[2vw]">
        <div className="flex flex-col items-start gap-[0.5vw]">
          <img src={logoCronex2} alt="Cronex" className="h-auto w-[20vw] object-contain" />
          <div className="text-[3.5vw] font-black text-[#871F80] leading-none">
            {speed} <span className="text-[1.2vw] text-slate-400 uppercase tracking-tighter">DPI</span>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <img src={logoAlpha2} alt="Alpha Gaming" className="w-[28vw] h-auto object-contain" />
        </div>
        <div className="flex flex-col items-end">
          <Link to="/" className="text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-[0.8vw]">← VOLVER AL MENÚ</Link>
        </div>
      </header>

      {/* ÁREA CENTRAL DE JUEGO ESCALABLE */}
      <div className="flex-1 flex justify-center items-start gap-[2vw] px-[2vw]">
        <div className="bg-white p-[1.5vw] rounded-[3vw] shadow-2xl border border-slate-100 flex gap-[2vw]">
          
          {/* CARRETERA (MOUSEPAD) - ESCALADO PROPORCIONAL A 600px */}
          <div className="w-[20vw] h-[34vw] bg-slate-800 rounded-[1.5vw] border-[0.5vw] border-slate-700 relative shadow-inner overflow-hidden">
            <div className={`absolute left-1/2 -translate-x-1/2 w-[0.15vw] h-[200%] border-l-[0.2vw] border-dashed border-white/10 ${gameStarted && !isGameOver ? 'animate-road' : ''}`} />

            {/* JUGADOR: MOUSE GAMER */}
            <div
              style={{ transform: `translateX(${carX * 0.055}vw)` }} // Ajuste visual de la traslación a vw
              className="absolute bottom-[3vw] left-1/2 -translate-x-1/2 w-[3.5vw] h-[5.5vw] bg-slate-100 rounded-[1.2vw_1.2vw_1.5vw_1.5vw] shadow-[0_0.6vw_0_rgba(0,0,0,0.3)] border-b-[0.4vw] border-slate-300 transition-transform duration-75 ease-out z-20 flex flex-col items-center"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[0.1vw] h-[2vw] bg-slate-300" />
              <div className="w-[0.7vw] h-[1.5vw] bg-slate-800 rounded-full mt-[1vw] shadow-inner border-t-[0.15vw] border-slate-600" />
              <div className="mt-auto mb-[0.8vw] w-[1.2vw] h-[1.2vw] rounded-full bg-[#871F80]/20 flex items-center justify-center animate-pulse">
                <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-[#871F80]" />
              </div>
              <div className="absolute top-[0.8vw] left-[0.4vw] w-[0.4vw] h-[2vw] bg-white/60 rounded-full blur-[0.1vw]" />
            </div>

            {/* ENEMIGOS: TECLADOS MECÁNICOS */}
            {enemies.map((enemy) => (
              <div
                key={enemy.id}
                style={{ 
                  transform: `translate(calc(-50% + ${enemy.x * 0.055}vw), ${enemy.y * 0.055}vw)` 
                }}
                className="absolute left-1/2 w-[4.5vw] h-[5.5vw] bg-slate-900 rounded-[0.5vw] shadow-lg border-b-[0.5vw] border-black flex flex-wrap p-[0.4vw] gap-[0.2vw] justify-center content-center"
              >
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-[1vw] h-[1vw] bg-slate-700 rounded-[0.1vw] border-b-[0.15vw] border-slate-800" />
                ))}
                <div className="w-full h-[0.2vw] bg-[#871F80]/40 rounded-full mt-[0.2vw]" />
              </div>
            ))}
          </div>

          {/* PANEL LATERAL ESCALABLE */}
          <aside className="w-[12vw] flex flex-col gap-[1.5vw]">
            <div className="bg-[#871F80] rounded-[2vw] p-[1.5vw] text-white shadow-lg text-center">
              <h3 className="text-[0.6vw] font-black text-white/60 uppercase tracking-[0.2em] mb-[0.5vw]">SCORE</h3>
              <p className="text-[2.5vw] font-black">{score}</p>
            </div>

            <div className="bg-slate-50 rounded-[2vw] p-[1.5vw] border border-slate-100">
              <h3 className="text-[0.6vw] font-black text-slate-400 uppercase tracking-[0.2em] mb-[0.8vw] text-center">CONTROLES</h3>
              <div className="space-y-[0.4vw] text-[0.6vw] font-bold text-slate-400 text-center uppercase">
                <p>FLECHAS : DESLIZAR</p>
                <p>EVITA LOS TECLADOS</p>
              </div>
            </div>

            <button
              onClick={handleAction}
              className={`w-full py-[1.2vw] rounded-[1.2vw] font-black transition-all shadow-md active:scale-95 text-[1.2vw] ${
                gameStarted 
                ? 'bg-white border-[0.15vw] border-slate-100 text-[#871F80] hover:bg-slate-50' 
                : 'bg-[#871F80] text-white hover:bg-[#6b1860] shadow-[0_0.5vw_0_rgb(90,20,85)] translate-y-[-0.3vw]'
              }`}
            >
              {gameStarted ? "PAUSAR" : "CONECTAR"}
            </button>
          </aside>
        </div>
      </div>

      {/* CONTROLES INFERIORES ESCALABLES */}
      <div className="p-[3vw] flex justify-center gap-[2vw]">
        <button onMouseDown={moveLeft} className="w-[6vw] h-[6vw] bg-white rounded-[1.5vw] shadow-lg border-b-[0.3vw] border-slate-200 font-black text-[#871F80] text-[2.5vw] active:translate-y-[0.2vw] transition-all select-none">←</button>
        <button onMouseDown={moveRight} className="w-[6vw] h-[6vw] bg-white rounded-[1.5vw] shadow-lg border-b-[0.3vw] border-slate-200 font-black text-[#871F80] text-[2.5vw] active:translate-y-[0.2vw] transition-all select-none">→</button>
      </div>

      <style>{`
        @keyframes road-move {
          0% { transform: translate(-50%, -50%); }
          100% { transform: translate(-50%, 0%); }
        }
        .animate-road { animation: road-move 0.6s linear infinite; }
      `}</style>
    </main>
  );
}
