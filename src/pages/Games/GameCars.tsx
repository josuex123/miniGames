import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';

// --- CONFIGURACIÓN ---
const ROAD_WIDTH = 350;
const CAR_WIDTH = 60;
const CAR_HEIGHT = 100; // Ajustado para el mouse
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

  // --- MOVIMIENTO ---
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

  // --- GAME LOOP ---
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

        // Colisiones
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

  // --- TECLADO ---
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
      // Resetear todos los valores a su estado inicial
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
      
      {isGameOver && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center border-4 border-[#871F80]">
            <h2 className="text-6xl font-black text-slate-900 mb-2 italic">¡SYSTEM FAILURE!</h2>
            <p className="text-xl font-bold text-slate-400 mb-8 uppercase tracking-widest">Score Final: {score}</p>
            
            <button onClick={handleAction} className="bg-[#871F80] text-white px-10 py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-transform shadow-lg">
              REPARAR MOUSE
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="w-full px-6 sm:px-12 lg:px-20 py-10 grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.2fr] gap-8 items-center z-10">
        <div className="flex flex-col items-start gap-2">
          <img src={logoCronex2} alt="Cronex" className="h-auto w-[320px] object-contain" />
          <div className="text-6xl font-black text-[#871F80]">
            {speed} <span className="text-2xl text-slate-400 uppercase tracking-tighter">DPI</span>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <img src={logoAlpha2} alt="Alpha Gaming" className="w-[60vw] sm:w-[35vw] lg:w-[25vw] h-auto object-contain" />
        </div>
        <div className="flex flex-col items-center sm:items-end">
          <Link to="/" className="text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-xs">← VOLVER AL MENÚ</Link>
        </div>
      </header>

      {/* ÁREA CENTRAL DE JUEGO */}
      <div className="flex-1 flex justify-center items-start gap-8 px-6">
        <div className="bg-white p-6 rounded-[3.5rem] shadow-2xl border border-slate-100 flex gap-8">
          
          {/* CARRETERA (MOUSEPAD) */}
          <div className="w-[350px] h-[600px] bg-slate-800 rounded-3xl border-8 border-slate-700 relative shadow-inner overflow-hidden">
            <div className={`absolute left-1/2 -translate-x-1/2 w-2 h-[200%] border-l-4 border-dashed border-white/10 ${gameStarted && !isGameOver ? 'animate-road' : ''}`} />

            {/* JUGADOR: MOUSE GAMER */}
            <div
              style={{ transform: `translateX(${carX}px)` }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-16 h-24 bg-slate-100 rounded-[2rem_2rem_2.5rem_2.5rem] shadow-[0_10px_0_rgba(0,0,0,0.3)] border-b-[6px] border-slate-300 transition-transform duration-75 ease-out z-20 flex flex-col items-center"
            >
              {/* Botones principales */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-10 bg-slate-300" />
              {/* Scroll Wheel */}
              <div className="w-3 h-7 bg-slate-800 rounded-full mt-4 shadow-inner border-t-2 border-slate-600" />
              {/* Logo Alpha (Simulado) */}
              <div className="mt-auto mb-4 w-5 h-5 rounded-full bg-[#871F80]/20 flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 rounded-full bg-[#871F80]" />
              </div>
              {/* Brillo lateral */}
              <div className="absolute top-4 left-2 w-2 h-10 bg-white/60 rounded-full blur-[1px]" />
            </div>

            {/* ENEMIGOS: TECLADOS MECÁNICOS */}
            {enemies.map((enemy) => (
              <div
                key={enemy.id}
                style={{ transform: `translate(calc(-50% + ${enemy.x}px), ${enemy.y}px)` }}
                className="absolute left-1/2 w-20 h-24 bg-slate-900 rounded-lg shadow-lg border-b-8 border-black flex flex-wrap p-2 gap-1 justify-center content-center"
              >
                {/* Simulando teclas del teclado enemigo */}
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-slate-700 rounded-sm border-b-2 border-slate-800" />
                ))}
                <div className="w-full h-1 bg-[#871F80]/40 rounded-full mt-1" /> {/* Luz RGB enemiga */}
              </div>
            ))}
          </div>

          {/* PANEL LATERAL */}
          <aside className="w-48 flex flex-col gap-6">
            <div className="bg-[#871F80] rounded-[2.5rem] p-6 text-white shadow-lg text-center">
              <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2">SCORE</h3>
              <p className="text-4xl font-black">{score}</p>
            </div>

            <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">CONTROLES</h3>
              <div className="space-y-2 text-[10px] font-bold text-slate-400 text-center uppercase">
                <p>FLECHAS : DESLIZAR</p>
                <p>EVITA LOS TECLADOS</p>
              </div>
            </div>

            <button
              onClick={handleAction}
              className={`w-full py-6 rounded-2xl font-black transition-all shadow-md active:scale-95 text-xl ${
                gameStarted 
                ? 'bg-white border-2 border-slate-100 text-[#871F80] hover:bg-slate-50' 
                : 'bg-[#871F80] text-white hover:bg-[#6b1860] shadow-[0_8px_0_rgb(90,20,85)] translate-y-[-4px]'
              }`}
            >
              {gameStarted ? "PAUSAR" : "CONECTAR"}
            </button>
          </aside>
        </div>
      </div>

      {/* CONTROLES INFERIORES */}
      <div className="p-10 flex justify-center gap-8">
        <button onMouseDown={moveLeft} className="w-24 h-24 bg-white rounded-[2rem] shadow-lg border-b-4 border-slate-200 font-black text-[#871F80] text-3xl active:translate-y-1 transition-all select-none">←</button>
        <button onMouseDown={moveRight} className="w-24 h-24 bg-white rounded-[2rem] shadow-lg border-b-4 border-slate-200 font-black text-[#871F80] text-3xl active:translate-y-1 transition-all select-none">→</button>
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