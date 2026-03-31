import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';

// Constantes del juego
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

// Tipos de piezas Tetris
const TETRIS_PIECES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00F0F1',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#F0E61E',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#9D4EDD',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#3A86FF',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#FF006E',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#FB5607',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#FFBE0B',
  },
};

interface Piece {
  type: keyof typeof TETRIS_PIECES;
  rotation: number;
  x: number;
  y: number;
}

interface CellColor {
  color: string;
  filled: boolean;
}

export default function GameTetris() {
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Grid del juego
  const [grid, setGrid] = useState<CellColor[][]>(() =>
    Array(GRID_HEIGHT)
      .fill(null)
      .map(() =>
        Array(GRID_WIDTH)
          .fill(null)
          .map(() => ({ color: '', filled: false }))
      )
  );

  // Pieza actual
  const [currentPiece, setCurrentPiece] = useState<Piece>({
    type: 'T',
    rotation: 0,
    x: 3,
    y: 0,
  });

  // Siguiente pieza
  const [nextPiece, setNextPiece] = useState<Piece>({
    type: 'O',
    rotation: 0,
    x: 0,
    y: 0,
  });

  const gameLoopRef = useRef<number | null>(null);

  // Obtener forma rotada de una pieza
  const getRotatedShape = useCallback(
    (type: keyof typeof TETRIS_PIECES, rotation: number) => {
      let shape = TETRIS_PIECES[type].shape;
      for (let i = 0; i < rotation % 4; i++) {
        shape = shape[0].map((_, colIndex) =>
          shape.map((row) => row[colIndex]).reverse()
        );
      }
      return shape;
    },
    []
  );

  // Verificar colisión - MEJORADO
  const checkCollision = useCallback(
    (piece: Piece, grid: CellColor[][], offsetX = 0, offsetY = 0) => {
      const shape = getRotatedShape(piece.type, piece.rotation);
      const newX = piece.x + offsetX;
      const newY = piece.y + offsetY;

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const gridX = newX + x;
            const gridY = newY + y;

            // Colisión con bordes laterales
            if (gridX < 0 || gridX >= GRID_WIDTH) {
              return true;
            }

            // Colisión con piso
            if (gridY >= GRID_HEIGHT) {
              return true;
            }

            // Colisión con piezas colocadas (solo si está dentro del grid)
            if (gridY >= 0 && grid[gridY] && grid[gridY][gridX].filled) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [getRotatedShape]
  );

  // Colocar pieza en el grid
  const placePiece = useCallback(
    (piece: Piece, grid: CellColor[][]): CellColor[][] => {
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
    },
    [getRotatedShape]
  );

  // Limpiar líneas completas
  const clearLines = useCallback((grid: CellColor[][]): { newGrid: CellColor[][]; linesCleared: number } => {
    let newGrid = grid.map((row) => [...row]);
    let linesCleared = 0;

    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      if (newGrid[y].every((cell) => cell.filled)) {
        newGrid.splice(y, 1);
        newGrid.unshift(
          Array(GRID_WIDTH)
            .fill(null)
            .map(() => ({ color: '', filled: false }))
        );
        linesCleared++;
        y++; // Recheck this row
      }
    }

    return { newGrid, linesCleared };
  }, []);

  // Generar próxima pieza
  const generateNewPiece = useCallback((): Piece => {
    const types = Object.keys(TETRIS_PIECES) as Array<keyof typeof TETRIS_PIECES>;
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      type,
      rotation: 0,
      x: Math.floor((GRID_WIDTH - 3) / 2),
      y: 0,
    };
  }, []);

  // Mover pieza a la izquierda
  const moveLeft = useCallback(() => {
    if (isPaused || isGameOver || !isGameStarted) return;
    if (!checkCollision(currentPiece, grid, -1, 0)) {
      setCurrentPiece((prev) => ({ ...prev, x: prev.x - 1 }));
    }
  }, [currentPiece, grid, checkCollision, isPaused, isGameOver, isGameStarted]);

  // Mover pieza a la derecha
  const moveRight = useCallback(() => {
    if (isPaused || isGameOver || !isGameStarted) return;
    if (!checkCollision(currentPiece, grid, 1, 0)) {
      setCurrentPiece((prev) => ({ ...prev, x: prev.x + 1 }));
    }
  }, [currentPiece, grid, checkCollision, isPaused, isGameOver, isGameStarted]);

  // Rotar pieza
  const rotatePiece = useCallback(() => {
    if (isPaused || isGameOver || !isGameStarted) return;
    const newRotation = (currentPiece.rotation + 1) % 4;
    const testPiece = { ...currentPiece, rotation: newRotation };
    if (!checkCollision(testPiece, grid, 0, 0)) {
      setCurrentPiece(testPiece);
    }
  }, [currentPiece, grid, checkCollision, isPaused, isGameOver, isGameStarted]);

  // Caída rápida
  const dropFast = useCallback(() => {
    if (isPaused || isGameOver || !isGameStarted) return;
    if (!checkCollision(currentPiece, grid, 0, 1)) {
      setCurrentPiece((prev) => ({ ...prev, y: prev.y + 1 }));
    }
  }, [isPaused, isGameOver, isGameStarted, checkCollision, currentPiece, grid]);

  // Manejo de teclas
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isGameOver || !isGameStarted) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case ' ':
          e.preventDefault();
          rotatePiece();
          break;
        case 'ArrowDown':
          e.preventDefault();
          dropFast();
          break;
        case 'p':
        case 'P':
          setIsPaused((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveLeft, moveRight, rotatePiece, dropFast, isGameOver, isGameStarted]);

  // Loop del juego - MEJORADO
  useEffect(() => {
    if (!isGameStarted || isPaused || isGameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setCurrentPiece((prev) => {
        const newPiece = { ...prev, y: prev.y + 1 };

        // Verificar colisión después de mover hacia abajo
        if (checkCollision(newPiece, grid, 0, 0)) {
          // Pieza colisiona - colocarla en el grid (usar la posición anterior)
          let newGrid = placePiece(prev, grid);

          // Limpiar líneas
          const { newGrid: clearedGrid, linesCleared } = clearLines(newGrid);

          if (linesCleared > 0) {
            setLines((prevLines) => prevLines + linesCleared);
            setScore((prevScore) => prevScore + linesCleared * 100);
            setLevel((prevLevel) => Math.floor((prevLevel + linesCleared) / 10) + 1);
          }

          setGrid(clearedGrid);

          // Generar nueva pieza
          const newCurrent = nextPiece;

          // Verificar Game Over (si la pieza nueva colisiona inmediatamente)
          if (checkCollision(newCurrent, clearedGrid, 0, 0)) {
            setIsGameOver(true);
            return prev;
          }

          setCurrentPiece(newCurrent);
          setNextPiece(generateNewPiece());
          return newCurrent;
        }

        return newPiece;
      });
    }, Math.max(100, 500 - level * 30)); // Aumenta velocidad con nivel

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isGameStarted, isPaused, isGameOver, grid, checkCollision, placePiece, clearLines, nextPiece, level, generateNewPiece]);

  // Reiniciar juego
  const resetGame = useCallback(() => {
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsPaused(false);
    setIsGameOver(false);
    setIsGameStarted(false);
    setGrid(
      Array(GRID_HEIGHT)
        .fill(null)
        .map(() =>
          Array(GRID_WIDTH)
            .fill(null)
            .map(() => ({ color: '', filled: false }))
        )
    );
    setCurrentPiece({
      type: 'T',
      rotation: 0,
      x: 3,
      y: 0,
    });
    setNextPiece(generateNewPiece());
  }, [generateNewPiece]);

  // Iniciar juego
  const startGame = useCallback(() => {
    setIsGameStarted(true);
    setIsPaused(false);
  }, []);

  // Renderizar pieza actual en el canvas
  const renderGame = () => {
    const displayGrid = grid.map((row) => [...row]);
    const shape = getRotatedShape(currentPiece.type, currentPiece.rotation);
    const color = TETRIS_PIECES[currentPiece.type].color;

    // Dibujar pieza actual (preview)
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
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased">
      {/* Header Estilo Alpha */}
      <div className="w-full px-6 sm:px-12 lg:px-20 py-10 flex flex-col gap-12">
        <header className="grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.2fr] gap-8 items-center w-full">
          <div className="flex flex-col items-start gap-2">
            <img
              src={logoCronex2}
              alt="Cronex"
              className="h-auto w-[380px] lg:w-[420px] object-contain"
            />
            <div className="text-6xl font-black text-[#871F80]">
              {score} <span className="text-2xl text-slate-400 uppercase">Puntos</span>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <img
              src={logoAlpha2}
              alt="Alpha Gaming"
              className="w-[70vw] sm:w-[45vw] lg:w-[32vw] max-w-[900px] h-auto object-contain"
            />
          </div>

          <div className="flex flex-col items-center sm:items-end gap-4">
            <Link
              to="/"
              className="group text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-xs"
            >
              ← VOLVER AL MENÚ
            </Link>
          </div>
        </header>

        {/* Información del juego */}
        <div className="flex justify-center gap-8 text-sm font-bold text-slate-600">
          <div>
            Nivel: <span className="text-[#871F80]">{level}</span>
          </div>
          <div>
            Líneas: <span className="text-[#871F80]">{lines}</span>
          </div>
        </div>

        {/* Área de Juego Central */}
        <div className="flex justify-center items-start gap-8">
          <div className="bg-white p-6 rounded-[3.5rem] shadow-2xl border border-slate-100 flex gap-8">
            {/* Grid del Tetris */}
            <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-3xl border-8 border-slate-800 overflow-hidden shadow-inner">
              <div className="grid gap-0 p-2" style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
                width: '100%',
                height: '100%',
              }}>
                {displayGrid.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="border border-slate-700/30"
                      style={{
                        backgroundColor: cell.filled ? cell.color : 'transparent',
                        transition: 'background-color 0.05s ease-in-out',
                      }}
                    />
                  ))
                )}
              </div>

              {/* Overlay Game Over */}
              {isGameOver && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
                  <div className="text-white text-3xl font-black uppercase tracking-widest text-center">
                    Game Over
                  </div>
                  <button
                    onClick={resetGame}
                    className="bg-[#871F80] hover:bg-[#6B1860] text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Jugar de nuevo
                  </button>
                </div>
              )}

              {/* Overlay Pantalla de Inicio */}
              {!isGameStarted && !isGameOver && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-6">
                  <div className="text-white text-4xl font-black uppercase tracking-widest text-center">
                    Tetris
                  </div>
                  <button
                    onClick={startGame}
                    className="bg-[#871F80] hover:bg-[#6B1860] text-white font-bold py-3 px-8 rounded-lg transition-colors text-xl"
                  >
                    EMPEZAR
                  </button>
                </div>
              )}
            </div>

            {/* Panel Lateral Info */}
            <aside className="w-48 flex flex-col gap-6">
              <div className="bg-[#871F80] rounded-[2.5rem] p-6 text-white shadow-lg">
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-4 text-center">
                  Siguiente
                </h3>
                <div className="w-24 h-24 bg-white/10 rounded-2xl mx-auto border border-white/20 flex items-center justify-center overflow-hidden">
                  <div
                    className="grid gap-0"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(4, 1fr)`,
                      gridTemplateRows: `repeat(4, 1fr)`,
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    {Array(16)
                      .fill(null)
                      .map((_, i) => {
                        const shape = getRotatedShape(nextPiece.type, nextPiece.rotation);
                        const color = TETRIS_PIECES[nextPiece.type].color;
                        const y = Math.floor(i / 4);
                        const x = i % 4;
                        const filled = shape[y] && shape[y][x];

                        return (
                          <div
                            key={i}
                            style={{
                              backgroundColor: filled ? color : 'transparent',
                            }}
                          />
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 mt-auto">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">
                  Controles
                </h3>
                <div className="space-y-2 text-[10px] font-bold text-slate-400 text-center uppercase">
                  <p>← → : Mover</p>
                  <p>Espacio: Rotar</p>
                  <p>↓ : Caída rápida</p>
                  <p>P: Pausa</p>
                </div>
              </div>

              <button
                onClick={() => setIsPaused(!isPaused)}
                disabled={!isGameStarted || isGameOver}
                className="w-full bg-white border-2 border-slate-100 text-[#871F80] py-4 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPaused ? 'REANUDAR' : 'PAUSA'}
              </button>

              {isGameOver && (
                <button
                  onClick={resetGame}
                  className="w-full bg-[#871F80] text-white py-4 rounded-2xl font-black hover:bg-[#6B1860] transition-all shadow-md active:scale-95"
                >
                  NUEVO JUEGO
                </button>
              )}
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
