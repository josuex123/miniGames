import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';
import wolfImage from '../../assets/WolfGame.png'; 

const GRAVITY = 0.45;
const JUMP_FORCE = -11;
const GROUND_Y = 0;
const MAX_SPEED = 4.0;
const BASE_SPEED = 0.5;
const SPEED_INCREMENT = 0.008;

// Ajustes de Hitbox para el Lobo
const DINO_LEFT_PCT = 10.7;
const DINO_WIDTH_PCT = 6.0; 

const CACTUS_WIDTH_PCT = 3.8;
const CACTUS_HEIGHT_PX = 50;

const MIN_OBSTACLE_DISTANCE = 35; 
const MAX_OBSTACLES = 3;

interface Obstacle {
  id: number;
  x: number;
  type: 'cactus' | 'double-cactus';
  width: number;
  height: number;
}

export default function GameDyno() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('dyno-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const dinoY = useRef(GROUND_Y);
  const velocityY = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const gameActive = useRef(false);
  const scoreRef = useRef(0);
  const frameId = useRef<number>(0);
  const lastObstacleSpawn = useRef(100);

  const [visualDinoY, setVisualDinoY] = useState(0);
  const [visualObstacles, setVisualObstacles] = useState<Obstacle[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(BASE_SPEED);

  const jump = useCallback(() => {
    if (!gameActive.current || !isGameStarted) return;
    if (dinoY.current >= GROUND_Y - 1) {
      velocityY.current = JUMP_FORCE;
      setIsJumping(true);
    }
  }, [isGameStarted]);

  const startGame = useCallback(() => {
    setIsGameStarted(true);
    gameActive.current = true;
    dinoY.current = GROUND_Y;
    velocityY.current = 0;
    obstacles.current = [];
    scoreRef.current = 0;
    lastObstacleSpawn.current = 100;
    setScore(0);
    setIsGameOver(false);
    setVisualDinoY(0);
    setVisualObstacles([]);
    setIsJumping(false);
    setCurrentSpeed(BASE_SPEED);
  }, []);

  const resetGame = useCallback(() => {
    cancelAnimationFrame(frameId.current);
    startGame();
  }, [startGame]);

  const spawnObstacle = useCallback(() => {
    const types: Array<'cactus' | 'double-cactus'> = ['cactus', 'cactus', 'double-cactus'];
    const type = types[Math.floor(Math.random() * types.length)];

    const newObstacle: Obstacle = {
      id: Date.now() + Math.random(),
      x: 105,
      type,
      width: type === 'double-cactus' ? CACTUS_WIDTH_PCT * 1.8 : CACTUS_WIDTH_PCT,
      height: type === 'double-cactus' ? CACTUS_HEIGHT_PX * 1.1 : CACTUS_HEIGHT_PX,
    };

    obstacles.current.push(newObstacle);
    lastObstacleSpawn.current = 105;
  }, []);

  useEffect(() => {
    if (isGameOver || !isGameStarted) return;

    const loop = () => {
      if (!gameActive.current) return;

      velocityY.current += GRAVITY;
      dinoY.current += velocityY.current;

      if (dinoY.current >= GROUND_Y) {
        dinoY.current = GROUND_Y;
        velocityY.current = 0;
        setIsJumping(false);
      }

      const speed = Math.min(BASE_SPEED + scoreRef.current * SPEED_INCREMENT, MAX_SPEED);
      setCurrentSpeed(speed);

      obstacles.current = obstacles.current.map((obs) => ({
        ...obs,
        x: obs.x - speed,
      }));

      lastObstacleSpawn.current -= speed;

      obstacles.current = obstacles.current.filter((obs) => {
        if (obs.x < -10) {
          scoreRef.current += 1;
          setScore(scoreRef.current);
          return false;
        }
        return true;
      });

      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        localStorage.setItem('dyno-highscore', scoreRef.current.toString());
      }

      const canSpawn =
        obstacles.current.length < MAX_OBSTACLES &&
        lastObstacleSpawn.current < (100 - MIN_OBSTACLE_DISTANCE);

      if (canSpawn && Math.random() > 0.97) {
        spawnObstacle();
      }

      const dinoLeft = DINO_LEFT_PCT;
      const dinoRight = DINO_LEFT_PCT + DINO_WIDTH_PCT;
      const dinoBottom = -dinoY.current;

      for (const obs of obstacles.current) {
        const obsLeft = obs.x;
        const obsRight = obs.x + obs.width;
        const obsTop = obs.height;

        const marginX = 1.2; 
        const overlapX = dinoRight - marginX > obsLeft && dinoLeft + marginX < obsRight;
        const overlapY = dinoBottom < obsTop - 5; 

        if (overlapX && overlapY) {
          gameActive.current = false;
          setIsGameOver(true);
          return;
        }
      }

      setVisualDinoY(dinoY.current);
      setVisualObstacles([...obstacles.current]);

      frameId.current = requestAnimationFrame(loop);
    };

    frameId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId.current);
  }, [isGameOver, isGameStarted, spawnObstacle, highScore]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!isGameStarted) startGame();
        else if (isGameOver) resetGame();
        else jump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump, isGameOver, resetGame, isGameStarted, startGame]);

  return (
    <main className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-900 relative antialiased overflow-hidden">
      
      <style>{`
        @keyframes wolf-walk {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes wolf-jump-fx {
          0% { transform: scale(1); }
          50% { transform: scale(1.05) rotate(3deg); }
          100% { transform: scale(1); }
        }
        .wolf-walk {
          animation: wolf-walk 0.4s ease-in-out infinite;
        }
        .wolf-jump {
          animation: wolf-jump-fx 0.3s ease-out;
        }
      `}</style>

      {isGameOver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-[2rem] shadow-2xl text-center border-b-8 border-[#871F80]">
            <h2 className="text-5xl font-black text-slate-900 mb-2 italic tracking-tighter">FIN DEL JUEGO</h2>
            <p className="text-2xl font-bold text-[#871F80] mb-2">PUNTUACIÓN: {score}</p>
            <button
              onClick={resetGame}
              className="mt-6 bg-[#871F80] text-white px-12 py-4 rounded-xl font-black text-xl hover:brightness-110 active:scale-95 transition-all shadow-lg"
            >
              VOLVER A JUGAR
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 w-full px-6 py-8 flex flex-col gap-6">
        <header className="grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.2fr] gap-8 items-center w-full">
          <div className="flex flex-col items-start gap-2">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[380px]" />
            <div className="text-5xl font-black text-[#871F80] flex items-baseline gap-2">
              {score} <span className="text-sm text-slate-400 uppercase font-bold tracking-widest">Points</span>
            </div>
          </div>
          <div className="flex justify-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[70vw] sm:w-[32vw] h-auto object-contain" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link to="/" className="text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-xs">
              ← VOLVER AL MENÚ
            </Link>
          </div>
        </header>

        <section className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="w-full max-w-5xl h-64 bg-white rounded-[2rem] shadow-inner border-2 border-slate-200 relative overflow-hidden select-none">
            
            <div className="absolute top-10 w-12 h-4 bg-slate-100 rounded-full" style={{ right: `${10 + (score % 20)}%` }} />
            <div className="absolute top-20 w-16 h-5 bg-slate-100 rounded-full" style={{ left: `${15 + (score % 15)}%` }} />

            <div className="absolute bottom-6 w-full h-[2px] bg-slate-200" />

            {!isGameStarted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-30">
                <h2 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tighter">WOLF RUN</h2>
                <button onClick={startGame} className="bg-[#871F80] text-white px-10 py-4 rounded-xl font-black text-xl shadow-lg transition-all">
                  COMENZAR
                </button>
              </div>
            )}

            {/* PERSONAJE: EL LOBO */}
            <div
              style={{ transform: `translateY(${visualDinoY}px)` }}
              className="absolute bottom-6 left-24 w-20 h-32 z-20"
            >
              <img 
                src={wolfImage} 
                alt="Lobo" 
                className={`w-full h-full object-contain ${
                  isJumping ? 'wolf-jump' : (isGameStarted ? 'wolf-walk' : '')
                }`}
              />
            </div>

            {/* OBSTÁCULOS */}
            {visualObstacles.map((obs) => (
              <div
                key={obs.id}
                style={{ left: `${obs.x}%` }}
                className="absolute bottom-6 z-10"
              >
                {obs.type === 'cactus' ? (
                  <div className="w-10 h-14 flex items-end justify-center">
                    <div className="w-4 h-full bg-slate-800 rounded-t-full relative">
                      <div className="absolute left-[-8px] top-4 w-4 h-6 border-l-4 border-t-4 border-slate-800 rounded-tl-lg" />
                      <div className="absolute right-[-6px] top-2 w-4 h-8 border-r-4 border-t-4 border-slate-800 rounded-tr-lg" />
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 flex gap-1 items-end">
                    <div className="w-3 h-12 bg-slate-800 rounded-t-full relative">
                      <div className="absolute left-[-6px] top-3 w-3 h-5 border-l-3 border-t-3 border-slate-800 rounded-tl-lg" />
                    </div>
                    <div className="w-4 h-16 bg-slate-800 rounded-t-full relative">
                      <div className="absolute left-[-7px] top-4 w-4 h-6 border-l-4 border-t-4 border-slate-800 rounded-tl-lg" />
                      <div className="absolute right-[-5px] top-2 w-4 h-7 border-r-4 border-t-4 border-slate-800 rounded-tr-lg" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {isGameStarted && !isGameOver && (
            <button
              onMouseDown={jump}
              className="bg-[#871F80] text-white px-20 py-6 rounded-2xl font-black text-2xl shadow-xl transition-all"
            >
              SALTAR!
            </button>
          )}
        </section>
      </div>
    </main>
  );
}