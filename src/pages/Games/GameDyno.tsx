import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';

// --- CONFIGURACION DEL JUEGO ---
const GRAVITY = 0.45;
const JUMP_FORCE = -11;
const GROUND_Y = 0;
const MAX_SPEED = 4.0;
const BASE_SPEED = 0.5;
const SPEED_INCREMENT = 0.008;

// Hitbox del dinosaurio (en porcentaje del ancho del contenedor)
const DINO_LEFT_PCT = 10.7;
const DINO_WIDTH_PCT = 5.5;

// Hitbox del cactus
const CACTUS_WIDTH_PCT = 3.8;
const CACTUS_HEIGHT_PX = 50;

// Sistema de obstaculos
const MIN_OBSTACLE_DISTANCE = 35; // Distancia minima entre obstaculos (%)
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

  // Refs mecanicos (sin re-render)
  const dinoY = useRef(GROUND_Y);
  const velocityY = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const gameActive = useRef(false);
  const scoreRef = useRef(0);
  const frameId = useRef<number>(0);
  const lastObstacleSpawn = useRef(100);

  // Estado visual (dispara re-render)
  const [visualDinoY, setVisualDinoY] = useState(0);
  const [visualObstacles, setVisualObstacles] = useState<Obstacle[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(BASE_SPEED);

  // Salto: solo si esta en el suelo y el juego esta activo
  const jump = useCallback(() => {
    if (!gameActive.current || !isGameStarted) return;
    if (dinoY.current >= GROUND_Y - 1) {
      velocityY.current = JUMP_FORCE;
      setIsJumping(true);
    }
  }, [isGameStarted]);

  // Iniciar juego
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

  // Reset completo
  const resetGame = useCallback(() => {
    cancelAnimationFrame(frameId.current);
    startGame();
  }, [startGame]);

  // Generar nuevo obstaculo
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

  // Game Loop principal
  useEffect(() => {
    if (isGameOver || !isGameStarted) return;

    const loop = () => {
      if (!gameActive.current) return;

      // 1. Fisica del salto
      velocityY.current += GRAVITY;
      dinoY.current += velocityY.current;

      if (dinoY.current >= GROUND_Y) {
        dinoY.current = GROUND_Y;
        velocityY.current = 0;
        setIsJumping(false);
      }

      // 2. Calcular velocidad actual
      const speed = Math.min(BASE_SPEED + scoreRef.current * SPEED_INCREMENT, MAX_SPEED);
      setCurrentSpeed(speed);

      // 3. Mover obstaculos
      obstacles.current = obstacles.current.map((obs) => ({
        ...obs,
        x: obs.x - speed,
      }));

      // Actualizar posicion del ultimo spawn
      lastObstacleSpawn.current -= speed;

      // 4. Filtrar obstaculos fuera de pantalla y sumar puntos
      
      obstacles.current = obstacles.current.filter((obs) => {
        if (obs.x < -10) {
          scoreRef.current += 1;
          setScore(scoreRef.current);
          return false;
        }
        return true;
      });

      // Actualizar high score
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        localStorage.setItem('dyno-highscore', scoreRef.current.toString());
      }

      // 5. Spawn de nuevos obstaculos
      const canSpawn =
        obstacles.current.length < MAX_OBSTACLES &&
        lastObstacleSpawn.current < (100 - MIN_OBSTACLE_DISTANCE);

      if (canSpawn && Math.random() > 0.97) {
        spawnObstacle();
      }

      // 6. Deteccion de colisiones con hitbox precisa
      const dinoLeft = DINO_LEFT_PCT;
      const dinoRight = DINO_LEFT_PCT + DINO_WIDTH_PCT;
      const dinoBottom = -dinoY.current;

      for (const obs of obstacles.current) {
        const obsLeft = obs.x;
        const obsRight = obs.x + obs.width;
        const obsTop = obs.height;

        // Margen de tolerancia para hacer el juego mas justo
        const margin = 0.8;
        const overlapX = dinoRight - margin > obsLeft && dinoLeft + margin < obsRight;
        const overlapY = dinoBottom < obsTop - 5;

        if (overlapX && overlapY) {
          gameActive.current = false;
          setIsGameOver(true);
          return;
        }
      }

      // 7. Sincronizar estado visual
      setVisualDinoY(dinoY.current);
      setVisualObstacles([...obstacles.current]);

      frameId.current = requestAnimationFrame(loop);
    };

    frameId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId.current);
  }, [isGameOver, isGameStarted, spawnObstacle, highScore]);

  // Teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!isGameStarted) {
          startGame();
        } else if (isGameOver) {
          resetGame();
        } else {
          jump();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump, isGameOver, resetGame, isGameStarted, startGame]);

  return (
    <main className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-900 relative antialiased overflow-hidden">
      {/* MODAL GAME OVER */}
      {isGameOver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-[2rem] shadow-2xl text-center border-b-8 border-[#871F80]">
            <h2 className="text-5xl font-black text-slate-900 mb-2 italic tracking-tighter">
              FIN DEL JUEGO
            </h2>
            <p className="text-2xl font-bold text-[#871F80] mb-2">
              PUNTUACION: {score}
            </p>
            {score >= highScore && score > 0 && (
              <p className="text-lg font-bold text-amber-500 mb-4">
                NUEVO RECORD!
              </p>
            )}
            <p className="text-sm text-slate-400 mb-8">
              Mejor puntuacion: {highScore}
            </p>
            <button
              onClick={resetGame}
              className="bg-[#871F80] text-white px-12 py-4 rounded-xl font-black text-xl hover:brightness-110 active:scale-95 transition-all shadow-lg"
            >
              VOLVER A JUGAR
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 w-full px-6 py-8 flex flex-col gap-6">
        {/* HEADER */}
         <header className="grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.2fr] gap-8 items-center w-full">
          <div className="flex flex-col items-start gap-2">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[380px] lg:w-[420px] object-contain" />
            <div className="text-5xl font-black text-[#871F80] flex items-baseline gap-2">
              {score}
              <span className="text-sm text-slate-400 uppercase tracking-widest font-bold">
                Points
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Record: <span className="text-[#871F80] font-bold">{highScore}</span>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[70vw] sm:w-[45vw] lg:w-[32vw] max-w-[900px] h-auto object-contain" />
          </div>

          <div className="flex flex-col items-center sm:items-end">
             <Link to="/" className="group text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-xs">
                ← VOLVER AL MENÚ
             </Link>
             {isGameStarted && !isGameOver && (
              <div className="text-xs text-slate-400">
                Velocidad: <span className="text-[#871F80] font-bold">{currentSpeed.toFixed(1)}x</span>
              </div>
            )}
          </div>
        </header>


        {/* ESCENARIO */}
        <section className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="w-full max-w-5xl h-64 bg-white rounded-[2rem] shadow-inner border-2 border-slate-200 relative overflow-hidden select-none">
            {/* Nubes decorativas con parallax */}
            <div
              className="absolute top-10 w-12 h-4 bg-slate-100 rounded-full transition-transform duration-1000"
              style={{ right: `${10 + (score % 20)}%` }}
            />
            <div
              className="absolute top-20 w-16 h-5 bg-slate-100 rounded-full transition-transform duration-1000"
              style={{ left: `${15 + (score % 15)}%` }}
            />
            <div
              className="absolute top-6 w-10 h-3 bg-slate-100 rounded-full transition-transform duration-1000"
              style={{ left: `${50 + (score % 25)}%` }}
            />

            {/* Linea de tierra */}
            <div className="absolute bottom-6 w-full h-[2px] bg-slate-200" />

            {/* Pantalla de inicio */}
            {!isGameStarted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-30">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tighter">
                    DINO RUN
                  </h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Salta los obstaculos y consigue la mayor puntuacion
                  </p>
                  <button
                    onClick={startGame}
                    className="bg-[#871F80] text-white px-10 py-4 rounded-xl font-black text-xl hover:brightness-110 active:scale-95 transition-all shadow-lg"
                  >
                    COMENZAR
                  </button>
                  <p className="text-slate-400 text-xs mt-4">
                    o presiona <span className="text-[#871F80] font-bold">ESPACIO</span>
                  </p>
                </div>
              </div>
            )}

            {/* DINO */}
            <div
              style={{ transform: `translateY(${visualDinoY}px)` }}
              className="absolute bottom-6 left-24 w-14 h-14 z-20"
            >
              <div className="relative w-full h-full bg-[#871F80] rounded-lg shadow-md">
                {/* Ojo */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />
                {/* Cresta */}
                <div className="absolute -left-2 top-2 flex flex-col gap-1">
                  <div className="w-3 h-3 bg-[#6a1865] rotate-45" />
                  <div className="w-3 h-3 bg-[#6a1865] rotate-45" />
                </div>
                {/* Patas - solo se animan en el suelo */}
                {!isJumping && isGameStarted && (
                  <div className="absolute -bottom-2 w-full flex justify-around px-2">
                    <div className="w-3 h-4 bg-[#871F80] rounded-b-md animate-bounce" />
                    <div className="w-3 h-4 bg-[#871F80] rounded-b-md animate-bounce [animation-delay:0.15s]" />
                  </div>
                )}
              </div>
            </div>

            {/* OBSTACULOS */}
            {visualObstacles.map((obs) => (
              <div
                key={obs.id}
                style={{ left: `${obs.x}%` }}
                className="absolute bottom-6 z-10"
              >
                {obs.type === 'cactus' ? (
                  <div className="w-10 h-14">
                    <div className="relative w-full h-full flex items-end justify-center">
                      <div className="w-4 h-full bg-slate-800 rounded-t-full relative">
                        <div className="absolute left-[-8px] top-4 w-4 h-6 border-l-4 border-t-4 border-slate-800 rounded-tl-lg" />
                        <div className="absolute right-[-6px] top-2 w-4 h-8 border-r-4 border-t-4 border-slate-800 rounded-tr-lg" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 flex gap-1">
                    <div className="relative flex items-end justify-center">
                      <div className="w-3 h-12 bg-slate-800 rounded-t-full relative">
                        <div className="absolute left-[-6px] top-3 w-3 h-5 border-l-3 border-t-3 border-slate-800 rounded-tl-lg" />
                      </div>
                    </div>
                    <div className="relative flex items-end justify-center">
                      <div className="w-4 h-16 bg-slate-800 rounded-t-full relative">
                        <div className="absolute left-[-7px] top-4 w-4 h-6 border-l-4 border-t-4 border-slate-800 rounded-tl-lg" />
                        <div className="absolute right-[-5px] top-2 w-4 h-7 border-r-4 border-t-4 border-slate-800 rounded-tr-lg" />
                      </div>
                    </div>
                    <div className="relative flex items-end justify-center">
                      <div className="w-3 h-10 bg-slate-800 rounded-t-full relative">
                        <div className="absolute right-[-5px] top-2 w-3 h-5 border-r-3 border-t-3 border-slate-800 rounded-tr-lg" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* BOTON SALTAR */}
          {isGameStarted && !isGameOver && (
            <div className="flex flex-col items-center gap-4">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  jump();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  jump();
                }}
                className="bg-[#871F80] text-white px-20 py-6 rounded-2xl font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase italic"
              >
                SALTAR!
              </button>
              <p className="text-slate-400 font-bold text-sm tracking-widest">
                USA{' '}
                <span className="text-[#871F80] bg-white px-2 py-1 rounded shadow-sm">
                  ESPACIO
                </span>{' '}
                PARA JUGAR
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}