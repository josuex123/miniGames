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

  // Refs mecánicos
  const dinoY = useRef(GROUND_Y);
  const velocityY = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const gameActive = useRef(false);
  const scoreRef = useRef(0);
  const frameId = useRef<number>(0);
  const lastObstacleSpawn = useRef(100);

  // Estado visual
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
          50% { transform: translateY(-0.2vw); }
        }
        @keyframes wolf-jump-fx {
          0% { transform: scale(1); }
          50% { transform: scale(1.05) rotate(3deg); }
          100% { transform: scale(1); }
        }
        .wolf-walk { animation: wolf-walk 0.4s ease-in-out infinite; }
        .wolf-jump { animation: wolf-jump-fx 0.3s ease-out; }
      `}</style>

      {/* MODAL FIN DEL JUEGO */}
      {isGameOver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-[2vw] bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white p-[4vw] rounded-[3vw] shadow-2xl text-center border-b-[0.6vw] border-[#871F80] max-w-[40vw]">
            <h2 className="text-[4vw] font-black text-slate-900 mb-[1vw] italic tracking-tighter">FIN DEL JUEGO</h2>
            <p className="text-[2vw] font-bold text-[#871F80] mb-[1.5vw]">PUNTUACIÓN: {score}</p>
            <button
              onClick={resetGame}
              className="bg-[#871F80] text-white px-[4vw] py-[1.5vw] rounded-[1.2vw] font-black text-[1.5vw] hover:brightness-110 active:scale-95 transition-all shadow-lg"
            >
              VOLVER A JUGAR
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 w-full px-[5vw] py-[2.5vw] flex flex-col gap-[2.5vw]">
        
        {/* HEADER ESCALABLE */}
        <header className="grid grid-cols-[1.2fr_2fr_1.2fr] gap-[2vw] items-center w-full">
          <div className="flex flex-col items-start gap-[0.5vw]">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[22vw] object-contain" />
            <div className="text-[3.5vw] font-black text-[#871F80] flex items-baseline gap-[0.8vw] leading-none">
              {score} <span className="text-[0.8vw] text-slate-400 uppercase font-bold tracking-widest">Points</span>
            </div>
            <div className="text-[0.7vw] text-slate-400">Record: <span className="text-[#871F80] font-bold">{highScore}</span></div>
          </div>

          <div className="flex justify-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[32vw] h-auto object-contain" />
          </div>

          <div className="flex flex-col items-end gap-[0.5vw]">
            <Link to="/" className="text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-[0.8vw]">
              ← VOLVER AL MENÚ
            </Link>
            <div className="text-[0.7vw] text-slate-400">
              Velocidad: <span className="text-[#871F80] font-bold">{currentSpeed.toFixed(1)}x</span>
            </div>
          </div>
        </header>

        {/* ÁREA DE JUEGO */}
        <section className="flex-1 flex flex-col items-center justify-center gap-[3vw]">
          <div className="w-full max-w-[70vw] h-[18vw] bg-white rounded-[3vw] shadow-inner border-[0.2vw] border-slate-200 relative overflow-hidden select-none">
            
            {/* Nubes escalables */}
            <div className="absolute top-[3vw] w-[3vw] h-[1vw] bg-slate-100 rounded-full" style={{ right: `${10 + (score % 20)}%` }} />
            <div className="absolute top-[6vw] w-[4vw] h-[1.2vw] bg-slate-100 rounded-full" style={{ left: `${15 + (score % 15)}%` }} />
            <div className="absolute top-[2vw] w-[2.5vw] h-[0.8vw] bg-slate-100 rounded-full" style={{ left: `${50 + (score % 25)}%` }} />

            {/* Suelo */}
            <div className="absolute bottom-[2vw] w-full h-[0.1vw] bg-slate-200" />

            {!isGameStarted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-30">
                <h2 className="text-[2.5vw] font-black text-slate-900 mb-[1vw] italic tracking-tighter">WOLF RUN</h2>
                <button onClick={startGame} className="bg-[#871F80] text-white px-[3vw] py-[1.2vw] rounded-[1vw] font-black text-[1.5vw] shadow-lg transition-all">
                  COMENZAR
                </button>
              </div>
            )}

            {/* LOBO: Escalado con vw */}
            <div
              style={{ transform: `translateY(${visualDinoY * 0.1}vw)` }} // Escalamiento de la física a visual vw
              className="absolute bottom-[2vw] left-[8vw] w-[6vw] h-[8vw] z-20"
            >
              <img 
                src={wolfImage} 
                alt="Lobo" 
                className={`w-full h-full object-contain ${
                  isJumping ? 'wolf-jump' : (isGameStarted ? 'wolf-walk' : '')
                }`}
              />
            </div>

            {/* Obstáculos escalables */}
            {visualObstacles.map((obs) => (
              <div
                key={obs.id}
                style={{ left: `${obs.x}%` }}
                className="absolute bottom-[2vw] z-10"
              >
                {obs.type === 'cactus' ? (
                  <div className="w-[3vw] h-[4vw] flex items-end justify-center">
                    <div className="w-[1vw] h-full bg-slate-800 rounded-t-full relative">
                      <div className="absolute left-[-0.5vw] top-[1vw] w-[0.8vw] h-[1.5vw] border-l-[0.25vw] border-t-[0.25vw] border-slate-800 rounded-tl-[0.5vw]" />
                      <div className="absolute right-[-0.4vw] top-[0.5vw] w-[0.8vw] h-[2vw] border-r-[0.25vw] border-t-[0.25vw] border-slate-800 rounded-tr-[0.5vw]" />
                    </div>
                  </div>
                ) : (
                  <div className="w-[5vw] h-[5vw] flex gap-[0.2vw] items-end">
                    <div className="w-[0.8vw] h-[3.5vw] bg-slate-800 rounded-t-full relative">
                      <div className="absolute left-[-0.4vw] top-[1vw] w-[0.6vw] h-[1.2vw] border-l-[0.18vw] border-t-[0.18vw] border-slate-800 rounded-tl-[0.3vw]" />
                    </div>
                    <div className="w-[1vw] h-[4.5vw] bg-slate-800 rounded-t-full relative">
                      <div className="absolute left-[-0.5vw] top-[1.2vw] w-[0.8vw] h-[1.5vw] border-l-[0.25vw] border-t-[0.25vw] border-slate-800 rounded-tl-[0.5vw]" />
                      <div className="absolute right-[-0.4vw] top-[0.8vw] w-[0.8vw] h-[1.8vw] border-r-[0.25vw] border-t-[0.25vw] border-slate-800 rounded-tr-[0.5vw]" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onMouseDown={jump}
            className="bg-[#871F80] text-white px-[6vw] py-[2vw] rounded-[1.5vw] font-black text-[2vw] shadow-xl transition-all uppercase italic"
          >
            SALTAR!
          </button>
        </section>
      </div>
    </main>
  );
}