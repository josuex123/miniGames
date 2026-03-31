import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';

// --- INTERFACES ---
interface WordConfig {
  word: string;
}

const MAX_ATTEMPTS = 6;

// --- COMPONENTE VISUAL DEL AHORCADO ---
const HangmanFigure: React.FC<{ wrongCount: number }> = ({ wrongCount }) => {
  const partStyle = "absolute bg-slate-800 transition-all duration-500 shadow-sm";
  return (
    <div className="relative h-64 w-48 mx-auto border-b-4 border-slate-200">
      <div className="absolute bottom-0 left-4 w-1 h-full bg-slate-200" />
      <div className="absolute top-0 left-4 w-32 h-1 bg-slate-200" />
      <div className="absolute top-0 right-12 w-1 h-8 bg-slate-300" />

      {/* Cabeza */}
      <div className={`${partStyle} top-8 right-8 w-10 h-10 rounded-full border-4 border-slate-800 ${wrongCount > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
      {/* Cuerpo */}
      <div className={`${partStyle} top-[72px] right-[51px] w-1.5 h-20 ${wrongCount > 1 ? 'opacity-100' : 'opacity-0'}`} />
      {/* Brazo Izquierdo */}
      <div className={`${partStyle} top-24 right-[51px] w-1.5 h-12 origin-bottom rotate-45 ${wrongCount > 2 ? 'opacity-100' : 'opacity-0'}`} />
      {/* Brazo Derecho */}
      <div className={`${partStyle} top-24 right-[51px] w-1.5 h-12 origin-bottom -rotate-45 ${wrongCount > 3 ? 'opacity-100' : 'opacity-0'}`} />
      {/* Pierna Izquierda */}
      <div className={`${partStyle} top-[150px] right-[51px] w-1.5 h-12 origin-top rotate-45 ${wrongCount > 4 ? 'opacity-100' : 'opacity-0'}`} />
      {/* Pierna Derecha */}
      <div className={`${partStyle} top-[150px] right-[51px] w-1.5 h-12 origin-top -rotate-45 ${wrongCount > 5 ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};

export default function GameHangMan() {
  const [activeWord, setActiveWord] = useState<WordConfig | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [newWordInput, setNewWordInput] = useState("");
  
  // --- LÓGICA DE JUEGO ---
  const wordToGuess = activeWord?.word.toUpperCase() || "";
  const wrongLetters = Array.from(guessedLetters).filter(l => !wordToGuess.includes(l));
  const attemptsLeft = MAX_ATTEMPTS - wrongLetters.length;
  
  const isLoser = attemptsLeft <= 0;
  const isWinner = wordToGuess !== "" && wordToGuess.split('').every(l => guessedLetters.has(l));
  const isGameOver = isLoser || isWinner;

  // Manejador del Input: Bloquea cualquier cosa que no sea letra en tiempo real
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Regex: Busca todo lo que NO sea A-Z o Ñ y lo elimina
    const onlyLetters = value.replace(/[^A-ZÑ]/g, '');
    setNewWordInput(onlyLetters);
  };

  const addLetter = useCallback((letter: string) => {
    if (!activeWord || isGameOver || guessedLetters.has(letter)) return;
    setGuessedLetters(prev => new Set([...prev, letter]));
  }, [activeWord, isGameOver, guessedLetters]);

  // Evento de teclado físico
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key.match(/^[A-ZÑ]$/)) addLetter(key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addLetter]);

  const startNewGame = () => {
    if (!newWordInput) return;
    
    // Al iniciar, la palabra anterior se borra y los estados se reinician
    setActiveWord({ word: newWordInput });
    setGuessedLetters(new Set());
    setNewWordInput("");
  };

  const resetAfterModal = () => {
    setActiveWord(null);
    setGuessedLetters(new Set());
  };

  const KEYS = 'QWERTYUIOPASDFGHJKLZXCVBNMÑ'.split('');

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased">
      
      {/* MODAL DE ESTADO */}
      {isGameOver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className={`relative p-10 lg:p-16 rounded-[3rem] shadow-2xl text-center max-w-2xl w-full border-4 animate-in zoom-in duration-300 ${isWinner ? "bg-emerald-500 border-emerald-300 shadow-emerald-500/50" : "bg-red-500 border-red-300 shadow-red-500/50"}`}>
            <h2 className="text-4xl lg:text-7xl font-black text-white uppercase mb-4 tracking-tighter drop-shadow-md">
              {isWinner ? "¡LO LOGRASTE!" : "¡AHORCADO!"}
            </h2>
            <p className="text-white/90 text-xl lg:text-2xl font-bold mb-8 uppercase">
              {isWinner ? "Eres un experto ✨" : `La palabra era: ${wordToGuess} ⌛`}
            </p>
            <button onClick={resetAfterModal} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-transform shadow-lg">
              CONTINUAR
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-1 w-full px-6 sm:px-12 lg:px-20 py-10 flex flex-col gap-12">
        <header className="grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.2fr] gap-8 items-center w-full">
          <div className="flex flex-col items-start gap-2">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[380px] lg:w-[420px] object-contain" />
            <div className="text-6xl font-black text-[#871F80]">
              {attemptsLeft} <span className="text-2xl text-slate-400 uppercase">Vidas</span>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[70vw] sm:w-[45vw] lg:w-[32vw] max-w-[900px] h-auto object-contain" />
          </div>

          <div className="flex flex-col items-center sm:items-end">
             <Link to="/" className="group text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-xs">
                ← VOLVER AL MENÚ
             </Link>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ASIDE: PALABRA OCULTA */}
          <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white shadow-xl min-h-[200px]">
              <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.3em]">Reto Actual</h3>
              
              {!activeWord ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-slate-400 font-bold text-sm">Esperando palabra válida...</p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border-2 border-[#871F80] bg-[#871F80]/5 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-[#871F80]/60 uppercase tracking-widest">Longitud</span>
                  <span className="text-4xl font-black text-[#871F80] tracking-[0.2em]">
                    {activeWord.word.replace(/./g, '*')}
                  </span>
                </div>
              )}
            </div>

            {/* FORMULARIO AGREGAR CON FILTRO DE CARACTERES */}
            <div className="bg-[#871F80] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <h3 className="text-xs font-black text-white/60 mb-6 uppercase tracking-[0.3em]">Nueva Partida</h3>
              <div className="space-y-4 relative z-10">
                <input 
                  type="password" 
                  placeholder="SOLO LETRAS..."
                  value={newWordInput}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && startNewGame()}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none placeholder:text-white/40 font-bold focus:bg-white/20 transition-all uppercase"
                />
                <button 
                  onClick={startNewGame}
                  className="w-full bg-white text-[#871F80] py-3 rounded-xl font-black hover:bg-slate-100 active:scale-95 transition-all shadow-lg"
                >
                  ¡COMENZAR JUEGO!
                </button>
              </div>
            </div>
          </aside>

          {/* ÁREA DE JUEGO */}
          <section className="lg:col-span-8 order-1 lg:order-2 space-y-6">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 min-h-[550px] flex flex-col items-center justify-between">
              
              <div className="py-4">
                <HangmanFigure wrongCount={wrongLetters.length} />
              </div>

              <div className="flex flex-wrap justify-center gap-4 py-8">
                {activeWord ? (
                  wordToGuess.split('').map((letter, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className={`text-5xl lg:text-7xl font-black text-slate-800 transition-all ${guessedLetters.has(letter) || isLoser ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {letter}
                      </span>
                      <div className={`h-2 w-12 lg:w-16 rounded-full mt-2 ${guessedLetters.has(letter) ? 'bg-[#871F80]' : 'bg-slate-200'}`} />
                    </div>
                  ))
                ) : (
                  <div className="text-center">
                    <p className="text-[#871F80] font-black text-3xl mb-2">MODO DESAFÍO</p>
                    <p className="text-slate-300 font-bold">Ingresa una palabra para empezar</p>
                  </div>
                )}
              </div>

              {/* TECLADO VIRTUAL */}
              <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-10 gap-2 w-full max-w-2xl">
                {KEYS.map(key => {
                  const isUsed = guessedLetters.has(key);
                  const isCorrect = isUsed && wordToGuess.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => addLetter(key)}
                      disabled={isUsed || !activeWord || isGameOver}
                      className={`py-3 rounded-xl font-black text-sm transition-all shadow-sm
                        ${isCorrect ? 'bg-emerald-500 text-white' : 
                          isUsed ? 'bg-slate-100 text-slate-300' : 
                          'bg-white border border-slate-100 hover:border-[#871F80] hover:text-[#871F80] active:scale-90'}
                        ${!activeWord ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                      `}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}