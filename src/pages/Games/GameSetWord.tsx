import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';
import {Link} from 'react-router-dom'

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
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased">
      
      {/* MODAL DE ESTADO */}
      {(gameState === 'round-win' || gameState === 'lost') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className={`relative p-10 lg:p-16 rounded-[3rem] shadow-2xl text-center max-w-2xl w-full border-4 animate-in zoom-in duration-300 ${gameState === 'round-win' ? "bg-emerald-500 border-emerald-300 shadow-emerald-500/50" : "bg-red-500 border-red-300 shadow-red-500/50"}`}>
            <div className="animate-pulse">
                <h2 className="text-4xl lg:text-7xl font-black text-white uppercase mb-4 tracking-tighter drop-shadow-md">
                {gameState === 'round-win' ? "¡Victoria!" : "¡Tiempo Agotado!"}
                </h2>
                <p className="text-white/90 text-xl lg:text-2xl font-bold mb-8">
                {gameState === 'round-win' ? `Lo lograste en ${seconds} segundos ✨` : "Inténtalo de nuevo, ¡tú puedes! ⌛"}
                </p>
            </div>
            <button onClick={resetRound} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-transform shadow-lg">CONTINUAR</button>
          </div>
        </div>
      )}
      {/* Barra de Progreso Superior */}
      <div className="fixed top-0 left-0 h-1.5 bg-slate-200 w-full z-50">
        <div 
          className="h-full transition-all duration-1000 bg-[#871F80]"
          style={{ width: `${(seconds / (selectedWord?.limit || 10)) * 100}%` }}
        />
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 lg:px-20 py-10 flex flex-col gap-12">
        {/* HEADER CON LOGOS REINTEGRADOS */}
        <header className="grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.2fr] gap-8 items-center w-full px-12 py-8">
          {/* 1. Logo Cronex + Tiempo (Izquierda) */}
          <div className="flex flex-col items-start gap-2">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[380px] lg:w-[420px] object-contain" />
            <div className="text-6xl lg:text-8xl font-black tabular-nums tracking-tighter text-[#871F80] leading-none">
              {formatTime()}
            </div>
          </div>

          {/* 2. Logo Alpha Central (Centro) */}
          <div className="flex justify-center items-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[70vw] sm:w-[45vw] lg:w-[32vw] max-w-[900px] h-auto object-contain" />
          </div>

          {/* 3. Columna de Control (Derecha) */}
          <div className="flex flex-col items-center sm:items-end gap-4">
            {/* Enlace Volver - Ahora encima del botón */}
            <Link 
              to="/" 
              className="group text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-xs"
            >
              ← VOLVER AL MENÚ
            </Link>

            {/* Botón Ganar - Alineado a la derecha en desktop */}
            <button 
              onClick={handleWinClick}
              disabled={!wordCompleted || gameState !== 'playing'}
              className={`w-full sm:w-[240px] py-4 lg:py-6 rounded-2xl text-2xl font-black uppercase transition-all shadow-xl ${
                wordCompleted && gameState === 'playing'
                ? "bg-[#871F80] text-white hover:scale-105 active:scale-95 cursor-pointer" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              ¡GANAR!
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ASIDE IZQUIERDO: RONDAS Y CREACIÓN */}
          <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            
            {/* 1. Lista de Rondas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white shadow-xl">
              <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.3em]">Rondas Disponibles</h3>
              <div className="grid grid-cols-1 gap-3 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                {targetWords.map((item) => (
                  <button
                    key={item.word}
                    onClick={() => handleSelectWord(item)}
                    disabled={gameState === 'playing'}
                    className={`group w-full p-5 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${
                      selectedWord?.word === item.word ? "border-[#871F80] bg-[#871F80]/5 scale-[1.02]" : "border-slate-50 hover:border-slate-200 bg-white"
                    } ${gameState === 'playing' && selectedWord?.word !== item.word ? "opacity-40 grayscale" : ""}`}
                  >
                    <span className={`text-xl font-black ${selectedWord?.word === item.word ? "text-[#871F80]" : "text-slate-700"}`}>{item.word}</span>
                    <span className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500 uppercase">{item.limit}s</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Formulario Agregar */}
            <div className="bg-[#871F80] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <h3 className="text-xs font-black text-white/60 mb-6 uppercase tracking-[0.3em] relative z-10">Nueva Ronda</h3>
              <div className="space-y-4 relative z-10">
                <input 
                  type="text" 
                  placeholder="Escribir palabra..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none placeholder:text-white/40 font-bold focus:bg-white/20 transition-all"
                />
                <div className="flex items-center gap-3">
                    <input 
                        type="number" 
                        placeholder="00"
                        value={newLimit}
                        onChange={(e) => setNewLimit(Number(e.target.value))}
                        className="w-20 bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none font-bold text-center"
                    />
                    <span className="text-[10px] font-black opacity-60">SEG.</span>
                    <button 
                        onClick={addNewWord}
                        className="flex-1 bg-white text-[#871F80] py-3 rounded-xl font-black hover:bg-slate-100 active:scale-95 transition-all shadow-lg"
                    >
                        AÑADIR
                    </button>
                </div>
              </div>
            </div>
          </aside>

          {/* SECCIÓN DERECHA: CAMPO DE JUEGO */}
          <section className="lg:col-span-8 order-1 lg:order-2">
            <div className="bg-white p-6 rounded-[3.5rem] shadow-2xl border border-slate-100 h-full flex flex-col justify-center min-h-[450px] transition-all">
              <div className="px-8 mb-4">
                <span className="text-xs font-black text-[#871F80] uppercase tracking-[0.25em]">
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
                className="w-full bg-transparent px-8 py-4 text-6xl lg:text-[9rem] font-black text-slate-800 outline-none placeholder:text-slate-100 leading-none transition-all"
              />
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}