'use client';
import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import logoAlpha2 from '../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../assets/LogoCronex2.svg';

export default function Home() {
  // ... (Tus estados se mantienen igual)
  const [seconds, setSeconds] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordCompleted, setWordCompleted] = useState<boolean>(false);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'round-win' | 'lost'>('idle');
  
  const targetWords: string[] = ["Cronex", "Alpha", "Gaming","Sildec"];
  const TIME_LIMIT = 10;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && seconds < TIME_LIMIT) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (seconds >= TIME_LIMIT && gameState === 'playing') {
      setGameState('lost');
      setIsActive(false);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, seconds, gameState]);

  const handleSelectWord = (word: string) => {
    setSeconds(0);
    setInputValue("");
    setSelectedWord(word);
    setWordCompleted(false);
    setGameState('playing');
    setIsActive(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (gameState !== 'playing') return;
    const val: string = e.target.value;
    setInputValue(val);
    setWordCompleted(val.trim().toLowerCase() === selectedWord?.toLowerCase());
  };

  const handleWinClick = () => {
    if (wordCompleted && seconds < TIME_LIMIT) {
      setGameState('round-win');
      setIsActive(false);
    }
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
    const remaining = Math.max(0, TIME_LIMIT - seconds);
    const secs = remaining % 60;
    return `00:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased">
      
      {/* MODAL INTERMITENTE */}
      {(gameState === 'round-win' || gameState === 'lost') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`
            relative p-10 lg:p-16 rounded-[3rem] shadow-2xl text-center max-w-2xl w-full
            animate-bounce-subtle border-4
            ${gameState === 'round-win' 
                ? "bg-emerald-500 border-emerald-300 shadow-emerald-500/50" 
                : "bg-red-500 border-red-300 shadow-red-500/50"}
          `}>
            {/* Efecto de parpadeo de texto (intermitente) */}
            <div className="animate-pulse">
                <h2 className="text-4xl lg:text-7xl font-black text-white uppercase mb-4 drop-shadow-md">
                {gameState === 'round-win' ? "¡Victoria!" : "¡Tiempo Agotado!"}
                </h2>
                <p className="text-white/90 text-xl lg:text-2xl font-bold mb-8">
                {gameState === 'round-win' 
                    ? `Lo lograste en ${seconds} segundos ✨` 
                    : "Inténtalo de nuevo, ¡tú puedes! ⌛"}
                </p>
            </div>
            
            <button 
              onClick={resetRound}
              className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-transform"
            >
              CONTINUAR
            </button>
          </div>
        </div>
      )}

      {/* Barra de Progreso */}
      <div className="fixed top-0 left-0 h-1.5 bg-slate-200 w-full z-50">
        <div 
          className="h-full transition-all duration-1000 bg-gradient-to-r from-[#871F80] to-[#b029a6]"
          style={{ width: `${(seconds / TIME_LIMIT) * 100}%` }}
        />
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 lg:px-20 py-10 flex flex-col gap-12">
        <header className="grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.2fr] gap-8 items-center w-full">
          <div className="flex flex-col items-start gap-2">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[460px] lg:w-[520px] object-contain" />
            <div className="text-6xl lg:text-8xl font-black tabular-nums tracking-tight text-[#871F80]">
              {formatTime()}
            </div>
          </div>

          <div className="flex justify-center items-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[70vw] sm:w-[45vw] lg:w-[35vw] max-w-[1000px] h-auto object-contain" />
          </div>

          <div className="flex flex-col items-center sm:items-end gap-4">
            <button 
              onClick={handleWinClick}
              disabled={!wordCompleted || gameState !== 'playing'}
              className={`w-full sm:w-[240px] py-4 lg:py-6 rounded-2xl text-2xl font-black uppercase transition-all ${
                wordCompleted && gameState === 'playing'
                ? "bg-[#871F80] text-white shadow-lg cursor-pointer" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              ¡GANAR!
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100">
              <div className="px-8 pt-6">
                <span className="text-[11px] font-black text-[#871F80] uppercase tracking-[0.2em]">
                  {selectedWord ? `Escribe el objetivo: ${selectedWord}` : "Selecciona una ronda..."}
                </span>
              </div>
              <input 
                ref={inputRef}
                type="text"
                disabled={!selectedWord || gameState !== 'playing'}
                value={inputValue}
                onChange={handleChange}
                placeholder="Escribe aquí..."
                className="w-full bg-transparent px-8 py-8 lg:py-12 text-5xl lg:text-8xl font-black text-slate-800 outline-none placeholder:text-slate-100"
              />
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white shadow-xl">
              <h3 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.3em] text-center lg:text-left">Rondas Disponibles</h3>
              <div className="space-y-4">
                {targetWords.map((word) => (
                  <button
                    key={word}
                    onClick={() => handleSelectWord(word)}
                    disabled={gameState === 'playing'}
                    className={`w-full p-6 rounded-[1.5rem] border-2 text-left transition-all ${
                      selectedWord === word ? "border-[#871F80] bg-white scale-[1.03]" : "border-slate-100 hover:bg-white"
                    } ${gameState === 'playing' && selectedWord !== word ? "opacity-40 grayscale" : ""}`}
                  >
                    <span className={`text-2xl font-black ${selectedWord === word ? "text-[#871F80]" : "text-slate-700"}`}>{word}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}