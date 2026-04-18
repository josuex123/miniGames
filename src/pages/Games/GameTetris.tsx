import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';

// Constantes del juego
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

const TETRIS_PIECES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00F0F1' },
  O: { shape: [[1, 1], [1, 1]], color: '#F0E61E' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#9D4EDD' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#3A86FF' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#FF006E' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#FB5607' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#FFBE0B' },
};

interface Piece { type: keyof typeof TETRIS_PIECES; rotation: number; x: number; y: number; }
interface CellColor { color: string; filled: boolean; }

export default function GameTetris() {
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const [grid, setGrid] = useState<CellColor[][]>(() =>
    Array(GRID_HEIGHT).fill(null).map(() =>
      Array(GRID_WIDTH).fill(null).map(() => ({ color: '', filled: false }))
    )
  );

  const [currentPiece, setCurrentPiece] = useState<Piece>({ type: 'T', rotation: 0, x: 3, y: 0 });
  const [nextPiece, setNextPiece] = useState<Piece>({ type: 'O', rotation: 0, x: 0, y: 0 });
  const gameLoopRef = useRef<number | null>(null);

  // --- LÓGICA ORIGINAL PRESERVADA ---

  const getRotatedShape = useCallback((type: keyof typeof TETRIS_PIECES, rotation: number) => {
    let shape = TETRIS_PIECES[type].shape;
    for (let i = 0; i < rotation % 4; i++) {
      shape = shape[0].map((_, colIndex) => shape.map((row) => row[colIndex]).reverse());
    }
    return shape;
  }, []);

  const checkCollision = useCallback((piece: Piece, grid: CellColor[][], offsetX = 0, offsetY = 0) => {
    const shape = getRotatedShape(piece.type, piece.rotation);
    const newX = piece.x + offsetX;
    const newY = piece.y + offsetY;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridX = newX + x;
          const gridY = newY + y;
          if (gridX < 0 || gridX >= GRID_WIDTH || gridY >= GRID_HEIGHT) return true;
          if (gridY >= 0 && grid[gridY] && grid[gridY][gridX].filled) return true;
        }
      }
    }
    return false;
  }, [getRotatedShape]);

  const placePiece = useCallback((piece: Piece, grid: CellColor[][]): CellColor[][] => {
    const newGrid = grid.map((row) => [...row]);
    const shape = getRotatedShape(piece.type, piece.rotation);
    const color = TETRIS_PIECES[piece.type].color;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = piece.y + y;
          const gridX = piece.x + x;
          if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
            newGrid[gridY][gridX] = { color, filled: true };
          }
        }
      }
    }
    return newGrid;
  }, [getRotatedShape]);

  const clearLines = useCallback((grid: CellColor[][]): { newGrid: CellColor[][]; linesCleared: number } => {
    let newGrid = grid.map((row) => [...row]);
    let linesCleared = 0;
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      if (newGrid[y].every((cell) => cell.filled)) {
        newGrid.splice(y, 1);
        newGrid.unshift(Array(GRID_WIDTH).fill(null).map(() => ({ color: '', filled: false })));
        linesCleared++;
        y++;
      }
    }
    return { newGrid, linesCleared };
  }, []);

  const generateNewPiece = useCallback((): Piece => {
    const types = Object.keys(TETRIS_PIECES) as Array<keyof typeof TETRIS_PIECES>;
    const type = types[Math.floor(Math.random() * types.length)];
    return { type, rotation: 0, x: Math.floor((GRID_WIDTH - 3) / 2), y: 0 };
  }, []);

  const moveLeft = useCallback(() => {
    if (isPaused || isGameOver || !isGameStarted) return;
    if (!checkCollision(currentPiece, grid, -1, 0)) setCurrentPiece((prev) => ({ ...prev, x: prev.x - 1 }));
  }, [currentPiece, grid, checkCollision, isPaused, isGameOver, isGameStarted]);

  const moveRight = useCallback(() => {
    if (isPaused || isGameOver || !isGameStarted) return;
    if (!checkCollision(currentPiece, grid, 1, 0)) setCurrentPiece((prev) => ({ ...prev, x: prev.x + 1 }));
  }, [currentPiece, grid, checkCollision, isPaused, isGameOver, isGameStarted]);

  const rotatePiece = useCallback(() => {
    if (isPaused || isGameOver || !isGameStarted) return;
    const newRotation = (currentPiece.rotation + 1) % 4;
    const testPiece = { ...currentPiece, rotation: newRotation };
    if (!checkCollision(testPiece, grid, 0, 0)) setCurrentPiece(testPiece);
  }, [currentPiece, grid, checkCollision, isPaused, isGameOver, isGameStarted]);

  const dropFast = useCallback(() => {
    if (isPaused || isGameOver || !isGameStarted) return;
    if (!checkCollision(currentPiece, grid, 0, 1)) setCurrentPiece((prev) => ({ ...prev, y: prev.y + 1 }));
  }, [isPaused, isGameOver, isGameStarted, checkCollision, currentPiece, grid]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isGameOver || !isGameStarted) return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); moveLeft(); break;
        case 'ArrowRight': e.preventDefault(); moveRight(); break;
        case ' ': e.preventDefault(); rotatePiece(); break;
        case 'ArrowDown': e.preventDefault(); dropFast(); break;
        case 'p': case 'P': setIsPaused((prev) => !prev); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveLeft, moveRight, rotatePiece, dropFast, isGameOver, isGameStarted]);

  useEffect(() => {
    if (!isGameStarted || isPaused || isGameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }
    gameLoopRef.current = window.setInterval(() => {
      setCurrentPiece((prev) => {
        const newPiece = { ...prev, y: prev.y + 1 };
        if (checkCollision(newPiece, grid, 0, 0)) {
          let newGrid = placePiece(prev, grid);
          const { newGrid: clearedGrid, linesCleared } = clearLines(newGrid);
          if (linesCleared > 0) {
            setLines((pl) => pl + linesCleared);
            setScore((ps) => ps + linesCleared * 100);
            setLevel((lv) => Math.floor((lv + linesCleared) / 10) + 1);
          }
          setGrid(clearedGrid);
          const newCurrent = nextPiece;
          if (checkCollision(newCurrent, clearedGrid, 0, 0)) { setIsGameOver(true); return prev; }
          setCurrentPiece(newCurrent);
          setNextPiece(generateNewPiece());
          return newCurrent;
        }
        return newPiece;
      });
    }, Math.max(100, 500 - level * 30));
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [isGameStarted, isPaused, isGameOver, grid, checkCollision, placePiece, clearLines, nextPiece, level, generateNewPiece]);

  const resetGame = useCallback(() => {
    setScore(0); setLines(0); setLevel(1); setIsPaused(false); setIsGameOver(false); setIsGameStarted(false);
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null).map(() => ({ color: '', filled: false }))));
    setCurrentPiece({ type: 'T', rotation: 0, x: 3, y: 0 }); setNextPiece(generateNewPiece());
  }, [generateNewPiece]);

  const renderGame = () => {
    const displayGrid = grid.map((row) => [...row]);
    const shape = getRotatedShape(currentPiece.type, currentPiece.rotation);
    const color = TETRIS_PIECES[currentPiece.type].color;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = currentPiece.y + y;
          const gridX = currentPiece.x + x;
          if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
            displayGrid[gridY][gridX] = { color, filled: true };
          }
        }
      }
    }
    return displayGrid;
  };

  const displayGrid = renderGame();

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased overflow-hidden">
      
      {/* HEADER ESCALABLE (Proporción 1920x1080) */}
      <div className="w-full px-[5vw] py-[3vw] flex flex-col gap-[2vw]">
        <header className="grid grid-cols-[1.2fr_2fr_1.2fr] gap-[2vw] items-center w-full border-b-[0.2vw] border-slate-200 pb-[2vw]">
          <div className="flex flex-col items-start gap-[0.5vw]">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[18vw] object-contain" />
            <div className="text-[3.5vw] font-black text-[#871F80] leading-none">
              {score} <span className="text-[1.2vw] text-slate-400 uppercase">Puntos</span>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[30vw] h-auto object-contain" />
          </div>

          <div className="flex flex-col items-end gap-[1vw]">
            <Link to="/" className="text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-[0.8vw]">
              ← VOLVER AL MENÚ
            </Link>
          </div>
        </header>

        {/* INFO BARS */}
        <div className="flex justify-center gap-[4vw] text-[1.1vw] font-bold text-slate-600 uppercase">
          <div>Nivel: <span className="text-[#871F80]">{level}</span></div>
          <div>Líneas: <span className="text-[#871F80]">{lines}</span></div>
        </div>

        {/* ÁREA DE JUEGO CENTRAL ESCALABLE */}
        <div className="flex justify-center items-start gap-[3vw]">
          <div className="bg-white p-[1.5vw] rounded-[3vw] shadow-2xl border border-slate-100 flex gap-[2.5vw]">
            
            {/* GRID DEL TETRIS: El alma del escalado */}
            <div className="relative w-[18vw] h-[36vw] bg-slate-900 rounded-[1.5vw] border-[0.6vw] border-slate-800 overflow-hidden shadow-inner">
              <div 
                className="grid h-full w-full p-[0.4vw]" 
                style={{
                  gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
                }}
              >
                {displayGrid.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="border-[0.05vw] border-slate-700/20"
                      style={{
                        backgroundColor: cell.filled ? cell.color : 'transparent',
                        transition: 'background-color 0.05s ease-in-out',
                      }}
                    />
                  ))
                )}
              </div>

              {/* OVERLAY GAME OVER */}
              {isGameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-[1.5vw] z-50">
                  <div className="text-white text-[2vw] font-black uppercase tracking-widest text-center">GAME OVER</div>
                  <button onClick={resetGame} className="bg-[#871F80] hover:bg-[#6B1860] text-white font-bold py-[0.8vw] px-[2vw] rounded-[0.8vw] transition-all text-[1vw]">
                    REINTENTAR
                  </button>
                </div>
              )}

              {/* OVERLAY INICIO */}
              {!isGameStarted && !isGameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-[2vw] z-50">
                  <div className="text-white text-[3vw] font-black uppercase tracking-widest">TETRIS</div>
                  <button onClick={() => setIsGameStarted(true)} className="bg-[#871F80] hover:bg-[#6B1860] text-white font-bold py-[1vw] px-[3vw] rounded-[1vw] transition-all text-[1.2vw]">
                    EMPEZAR
                  </button>
                </div>
              )}
            </div>

            {/* PANEL LATERAL INFO */}
            <aside className="w-[12vw] flex flex-col gap-[1.5vw]">
              <div className="bg-[#871F80] rounded-[2vw] p-[1.5vw] text-white shadow-lg">
                <h3 className="text-[0.6vw] font-black text-white/60 uppercase tracking-[0.2em] mb-[1vw] text-center">Siguiente</h3>
                <div className="w-[8vw] h-[8vw] bg-white/10 rounded-[1.2vw] mx-auto border border-white/20 flex items-center justify-center overflow-hidden">
                  <div 
                    className="grid gap-0" 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(4, 1fr)`,
                      gridTemplateRows: `repeat(4, 1fr)`,
                      width: '70%', height: '70%',
                    }}
                  >
                    {Array(16).fill(null).map((_, i) => {
                      const shape = getRotatedShape(nextPiece.type, nextPiece.rotation);
                      const color = TETRIS_PIECES[nextPiece.type].color;
                      const y = Math.floor(i / 4);
                      const x = i % 4;
                      const filled = shape[y] && shape[y][x];
                      return <div key={i} style={{ backgroundColor: filled ? color : 'transparent' }} />;
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-[2vw] p-[1.5vw] border border-slate-100">
                <h3 className="text-[0.6vw] font-black text-slate-400 uppercase tracking-[0.2em] mb-[0.8vw] text-center">Controles</h3>
                <div className="space-y-[0.4vw] text-[0.65vw] font-bold text-slate-400 text-center uppercase">
                  <p>← → Mover</p>
                  <p>Espacio: Rotar</p>
                  <p>↓: Caída Rápida</p>
                  <p>P: Pausa</p>
                </div>
              </div>

              <button
                onClick={() => setIsPaused(!isPaused)}
                disabled={!isGameStarted || isGameOver}
                className="w-full bg-white border-[0.15vw] border-slate-100 text-[#871F80] py-[1.2vw] rounded-[1.2vw] font-black text-[1vw] hover:bg-slate-50 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isPaused ? 'REANUDAR' : 'PAUSA'}
              </button>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}