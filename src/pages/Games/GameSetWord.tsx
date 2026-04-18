import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';
import { Link } from 'react-router-dom';

interface WordConfig {
  word: string;
  limit: number;
}

export default function GameSetWord() {
  const [seconds, setSeconds] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<WordConfig | null>(null);
  const [wordCompleted, setWordCompleted] = useState<boolean>(false);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'round-win' | 'lost'>('idle');

  const [targetWords, setTargetWords] = useState<WordConfig[]>([
    { word: "Cronex", limit: 10 },
    { word: "Alpha", limit: 5 },
    { word: "Gaming", limit: 8 },
    { word: "Sildec", limit: 12 }
  ]);

  const [newWord, setNewWord] = useState("");
  const [newLimit, setNewLimit] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA ORIGINAL PRESERVADA ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const currentLimit = selectedWord?.limit || 10;

    if (isActive && seconds < currentLimit) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (seconds >= currentLimit && gameState === 'playing') {
      setGameState('lost');
      setIsActive(false);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, seconds, gameState, selectedWord]);

  const handleSelectWord = (wordObj: WordConfig) => {
    setSeconds(0);
    setInputValue("");
    setSelectedWord(wordObj);
    setWordCompleted(false);
    setGameState('playing');
    setIsActive(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (gameState !== 'playing') return;
    const val: string = e.target.value;
    setInputValue(val);
    setWordCompleted(val.trim().toLowerCase() === selectedWord?.word.toLowerCase());
  };

  const handleWinClick = () => {
    if (wordCompleted && seconds < (selectedWord?.limit || 10)) {
      setGameState('round-win');
      setIsActive(false);
    }
  };

  const addNewWord = () => {
    if (!newWord.trim()) return;
    setTargetWords([...targetWords, { word: newWord.trim(), limit: newLimit }]);
    setNewWord("");
    setNewLimit(10);
  };

  const resetRound = () => {
    setSeconds(0);
    setInputValue("");
    setIsActive(false);
    setSelectedWord(null);
    setWordCompleted(false);
    setGameState('idle');
  };

  const formatTime = (): string => {
    const limit = selectedWord?.limit || 10;
    const remaining = Math.max(0, limit - seconds);
    return `00:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased overflow-hidden">

      {/* MODAL DE ESTADO ESCALABLE */}
      {(gameState === 'round-win' || gameState === 'lost') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-[2vw] bg-slate-900/40 backdrop-blur-md">
          <div className={`relative p-[4vw] rounded-[4vw] shadow-2xl text-center max-w-[40vw] w-full border-[0.3vw] animate-in zoom-in duration-300 ${gameState === 'round-win' ? "bg-emerald-500 border-emerald-300 shadow-emerald-500/50" : "bg-red-500 border-red-300 shadow-red-500/50"}`}>
            <div className="animate-pulse">
              <h2 className="text-[4vw] font-black text-white uppercase mb-[1vw] tracking-tighter drop-shadow-md">
                {gameState === 'round-win' ? "¡Victoria!" : "¡Tiempo Agotado!"}
              </h2>
              <p className="text-white/90 text-[1.5vw] font-bold mb-[2.5vw]">
                {gameState === 'round-win' ? `Lo lograste en ${seconds} segundos ✨` : "Inténtalo de nuevo, ¡tú puedes! ⌛"}
              </p>
            </div>
            <button onClick={resetRound} className="bg-white text-slate-900 px-[3vw] py-[1.2vw] rounded-[1.5vw] font-black text-[1.2vw] hover:scale-105 active:scale-95 transition-transform shadow-lg">
              CONTINUAR
            </button>
          </div>
        </div>
      )}

      {/* Barra de Progreso Superior */}
      <div className="fixed top-0 left-0 h-[0.4vw] bg-slate-200 w-full z-50">
        <div
          className="h-full transition-all duration-1000 bg-[#871F80]"
          style={{ width: `${(seconds / (selectedWord?.limit || 10)) * 100}%` }}
        />
      </div>

      <div className="flex-1 w-full px-[5vw] py-[3vw] flex flex-col gap-[3vw]">
        
        {/* HEADER ESCALABLE */}
        <header className="grid grid-cols-[1.2fr_2fr_1.2fr] gap-[2vw] items-center w-full pb-[2vw] border-b-[0.1vw] border-slate-200">
          {/* 1. Logo Cronex + Tiempo */}
          <div className="flex flex-col items-start gap-[0.5vw]">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[22vw] object-contain" />
            <div className="text-[5vw] font-black tabular-nums tracking-tighter text-[#871F80] leading-none">
              {formatTime()}
            </div>
          </div>

          {/* 2. Logo Alpha Central */}
          <div className="flex justify-center items-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[32vw] h-auto object-contain" />
          </div>

          {/* 3. Columna de Control */}
          <div className="flex flex-col items-end gap-[1vw]">
            <Link
              to="/"
              className="group text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-[0.7vw]"
            >
              ← VOLVER AL MENÚ
            </Link>

            <button
              onClick={handleWinClick}
              disabled={!wordCompleted || gameState !== 'playing'}
              className={`w-[14vw] py-[1.5vw] rounded-[1.2vw] text-[1.2vw] font-black uppercase transition-all shadow-xl ${
                wordCompleted && gameState === 'playing'
                  ? "bg-[#871F80] text-white hover:scale-105 active:scale-95 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              ¡GANAR!
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-[2.5vw]">

          {/* ASIDE IZQUIERDO: RONDAS Y CREACIÓN */}
          <aside className="col-span-4 space-y-[1.5vw]">
            {/* 1. Lista de Rondas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[2.5vw] p-[2vw] border border-white shadow-xl">
              <h3 className="text-[0.6vw] font-black text-slate-400 mb-[1.5vw] uppercase tracking-[0.3em]">Rondas Disponibles</h3>
              <div className="grid grid-cols-1 gap-[0.8vw] max-h-[25vw] overflow-y-auto pr-[0.5vw] custom-scrollbar">
                {targetWords.map((item) => (
                  <button
                    key={item.word}
                    onClick={() => handleSelectWord(item)}
                    disabled={gameState === 'playing'}
                    className={`group w-full p-[1.2vw] rounded-[1.2vw] border-[0.15vw] text-left transition-all flex justify-between items-center ${
                      selectedWord?.word === item.word ? "border-[#871F80] bg-[#871F80]/5 scale-[1.02]" : "border-slate-50 hover:border-slate-200 bg-white"
                    } ${gameState === 'playing' && selectedWord?.word !== item.word ? "opacity-40 grayscale" : ""}`}
                  >
                    <span className={`text-[1.2vw] font-black ${selectedWord?.word === item.word ? "text-[#871F80]" : "text-slate-700"}`}>{item.word}</span>
                    <span className="text-[0.6vw] font-bold bg-slate-100 px-[0.8vw] py-[0.4vw] rounded-[0.5vw] text-slate-500 uppercase">{item.limit}s</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Formulario Agregar */}
            <div className="bg-[#871F80] rounded-[2.5vw] p-[2vw] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[8vw] h-[8vw] bg-white/5 rounded-full -mr-[4vw] -mt-[4vw] transition-transform group-hover:scale-110" />
              <h3 className="text-[0.6vw] font-black text-white/60 mb-[1.2vw] uppercase tracking-[0.3em] relative z-10">Nueva Ronda</h3>
              <div className="space-y-[1vw] relative z-10">
                <input
                  type="text"
                  placeholder="Escribir palabra..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-[0.8vw] px-[1vw] py-[0.8vw] outline-none placeholder:text-white/40 font-bold focus:bg-white/20 transition-all text-[0.9vw]"
                />
                <div className="flex items-center gap-[0.8vw]">
                  <input
                    type="number"
                    placeholder="00"
                    value={newLimit}
                    onChange={(e) => setNewLimit(Number(e.target.value))}
                    className="w-[4.5vw] bg-white/10 border border-white/20 rounded-[0.8vw] px-[0.5vw] py-[0.8vw] outline-none font-bold text-center text-[0.9vw]"
                  />
                  <span className="text-[0.6vw] font-black opacity-60">SEG.</span>
                  <button
                    onClick={addNewWord}
                    className="flex-1 bg-white text-[#871F80] py-[0.8vw] rounded-[0.8vw] font-black text-[0.9vw] hover:bg-slate-100 active:scale-95 transition-all shadow-lg"
                  >
                    AÑADIR
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* SECCIÓN DERECHA: CAMPO DE JUEGO */}
          <section className="col-span-8">
            <div className="bg-white p-[2vw] rounded-[4vw] shadow-2xl border border-slate-100 h-full flex flex-col justify-center min-h-[25vw] transition-all">
              <div className="px-[2vw] mb-[1vw]">
                <span className="text-[0.8vw] font-black text-[#871F80] uppercase tracking-[0.25em]">
                  {selectedWord ? `OBJETIVO: ${selectedWord.word}` : "Selecciona un reto de la izquierda"}
                </span>
              </div>
              <input
                ref={inputRef}
                type="text"
                disabled={!selectedWord || gameState !== 'playing'}
                value={inputValue}
                onChange={handleChange}
                placeholder={selectedWord ? "¡Escribe aquí!" : "..."}
                className="w-full bg-transparent px-[2vw] py-[1vw] text-[8vw] font-black text-slate-800 outline-none placeholder:text-slate-100 leading-none transition-all"
              />
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}