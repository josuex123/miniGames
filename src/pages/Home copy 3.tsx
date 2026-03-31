'use client';
import { useState, useEffect } from 'react';
import logoAlpha2 from '../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../assets/LogoCronex2.svg';

interface WordConfig {
  word: string;
  limit: number;
}

export default function Home() {
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<WordConfig | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'win' | 'lost'>('idle');
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  
  const MAX_ERRORS = 6;
  const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

  // Lista inicial de palabras (Internas)
  const [targetWords, setTargetWords] = useState<WordConfig[]>([
    { word: "CRONEX", limit: 30 },
    { word: "ALPHA", limit: 20 },
    { word: "GAMING", limit: 25 },
    { word: "SILDEC", limit: 35 }
  ]);

  const [newWord, setNewWord] = useState("");
  const [newLimit, setNewLimit] = useState(30);

  // Lógica del Cronómetro
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const currentLimit = selectedWord?.limit || 30;

    if (isActive && seconds < currentLimit) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    } else if (seconds >= currentLimit && gameState === 'playing') {
      setGameState('lost');
      setIsActive(false);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, seconds, gameState, selectedWord]);

  // Lógica de Victoria/Derrota
  useEffect(() => {
    if (!selectedWord || gameState !== 'playing') return;

    const isWinner = selectedWord.word.split('').every(letter => 
      guessedLetters.includes(letter.toUpperCase())
    );

    if (isWinner) {
      setGameState('win');
      setIsActive(false);
    } else if (wrongGuesses >= MAX_ERRORS) {
      setGameState('lost');
      setIsActive(false);
    }
  }, [guessedLetters, wrongGuesses, selectedWord, gameState]);

  const handleSelectWord = (wordObj: WordConfig) => {
    setSeconds(0);
    setWrongGuesses(0);
    setGuessedLetters([]);
    setSelectedWord({ ...wordObj, word: wordObj.word.toUpperCase() });
    setGameState('playing');
    setIsActive(true);
  };

  const handleKeyPress = (letter: string) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter)) return;

    setGuessedLetters(prev => [...prev, letter]);
    if (!selectedWord?.word.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };

  const addNewWord = () => {
    if (!newWord.trim()) return;
    setTargetWords([...targetWords, { word: newWord.trim().toUpperCase(), limit: newLimit }]);
    setNewWord("");
  };

  const formatTime = (): string => {
    const limit = selectedWord?.limit || 30;
    const remaining = Math.max(0, limit - seconds);
    return `00:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased">
      
      {/* MODAL DE RESULTADO */}
      {(gameState === 'win' || gameState === 'lost') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className={`relative p-10 lg:p-16 rounded-[3rem] shadow-2xl text-center max-w-xl w-full border-4 animate-in zoom-in duration-300 ${gameState === 'win' ? "bg-emerald-500 border-emerald-300 shadow-emerald-500/50" : "bg-red-500 border-red-300 shadow-red-500/50"}`}>
            <h2 className="text-6xl font-black text-white uppercase mb-4 tracking-tighter drop-shadow-md">
              {gameState === 'win' ? "¡CONSEGUIDO!" : "¡DERROTADO!"}
            </h2>
            <p className="text-white/90 text-2xl font-bold mb-8">
              LA PALABRA ERA: <span className="bg-white/20 px-4 py-1 rounded-lg text-white">{selectedWord?.word}</span>
            </p>
            <button 
              onClick={() => { setGameState('idle'); setSelectedWord(null); }} 
              className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              NUEVO RETO
            </button>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="w-full px-6 lg:px-20 py-10 flex flex-col gap-12">
        <header className="grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.2fr] gap-8 items-center w-full">
          <div className="flex flex-col items-start gap-2">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[380px] lg:w-[420px] object-contain" />
            <div className="text-6xl lg:text-8xl font-black tabular-nums tracking-tighter text-[#871F80] leading-none">
              {formatTime()}
            </div>
          </div>

          <div className="flex justify-center items-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[70vw] sm:w-[45vw] lg:w-[32vw] max-w-[900px] h-auto object-contain" />
          </div>

          <div className="flex flex-col items-center sm:items-end">
            <div className="text-center sm:text-right bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Resistencia</span>
              <div className="text-4xl">
                {Array.from({ length: MAX_ERRORS - wrongGuesses }).map((_, i) => <span key={i}>❤️</span>)}
                {Array.from({ length: wrongGuesses }).map((_, i) => <span key={i} className="grayscale">💀</span>)}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
          
          {/* PANEL IZQUIERDO: RONDAS OCULTAS */}
          <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white shadow-xl">
              <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.3em]">Lista de Desafíos</h3>
              <div className="grid grid-cols-1 gap-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                {targetWords.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectWord(item)}
                    disabled={gameState === 'playing'}
                    className={`group w-full p-5 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${
                      selectedWord?.word === item.word ? "border-[#871F80] bg-[#871F80]/5" : "border-slate-50 hover:border-slate-200 bg-white"
                    } ${gameState === 'playing' && selectedWord?.word !== item.word ? "opacity-40" : ""}`}
                  >
                    <div className="flex flex-col">
                        <span className="font-black text-slate-700 text-lg">RETO #{index + 1}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Misterio oculto</span>
                    </div>
                    <span className="text-xs font-black bg-[#871F80] text-white px-3 py-1 rounded-full">{item.limit}s</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AÑADIR NUEVA PALABRA (SE OCULTARÁ AL AGREGAR) */}
            <div className="bg-[#871F80] rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative group">
              <h3 className="text-xs font-black text-white/60 mb-6 uppercase tracking-[0.3em] relative z-10">Programar Reto</h3>
              <div className="space-y-4 relative z-10">
                <input 
                  type="text" 
                  placeholder="Palabra secreta..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value.toUpperCase())}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none font-bold placeholder:text-white/30"
                />
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={newLimit}
                    onChange={(e) => setNewLimit(Number(e.target.value))}
                    className="w-20 bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none font-bold text-center"
                  />
                  <button onClick={addNewWord} className="flex-1 bg-white text-[#871F80] py-3 rounded-xl font-black hover:bg-slate-100 active:scale-95 transition-all">OK</button>
                </div>
              </div>
            </div>
          </aside>

          {/* AREA DE JUEGO (AHORCADO) */}
          <section className="lg:col-span-8 order-1 lg:order-2">
            <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 h-full flex flex-col items-center justify-between min-h-[550px]">
              
              {/* Espacios de la Palabra */}
              <div className="flex flex-wrap justify-center gap-4 my-auto">
                {selectedWord ? (
                  selectedWord.word.split('').map((letter, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <span className="text-6xl lg:text-[120px] font-black text-slate-800 uppercase min-w-[70px] text-center leading-none">
                        {guessedLetters.includes(letter) ? letter : ""}
                      </span>
                      <div className={`w-full h-3 rounded-full mt-2 transition-all duration-500 ${guessedLetters.includes(letter) ? "bg-emerald-500" : "bg-slate-200"}`} />
                    </div>
                  ))
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-[100px]">🕹️</div>
                    <p className="text-2xl font-black text-slate-300 tracking-widest uppercase">Elige un Reto a la izquierda</p>
                  </div>
                )}
              </div>

              {/* Teclado Visual Dinámico */}
              <div className="w-full max-w-4xl mt-12">
                <div className="grid grid-cols-7 sm:grid-cols-9 lg:grid-cols-[repeat(14,minmax(0,1fr))] gap-2">
                  {alphabet.map((letter) => {
                    const isUsed = guessedLetters.includes(letter);
                    const isCorrect = isUsed && selectedWord?.word.includes(letter);
                    const isWrong = isUsed && !selectedWord?.word.includes(letter);

                    return (
                      <button
                        key={letter}
                        onClick={() => handleKeyPress(letter)}
                        disabled={isUsed || gameState !== 'playing'}
                        className={`
                          aspect-square flex items-center justify-center rounded-xl font-black text-xl transition-all duration-200
                          ${!isUsed ? "bg-slate-100 text-slate-600 hover:bg-[#871F80] hover:text-white hover:scale-110" : ""}
                          ${isCorrect ? "bg-emerald-500 text-white shadow-lg" : ""}
                          ${isWrong ? "bg-slate-200 text-slate-400 cursor-not-allowed scale-90" : ""}
                          ${gameState !== 'playing' ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}