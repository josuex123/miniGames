import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import logoAlpha2 from '../../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../../assets/LogoCronex2.svg';

// --- INTERFACES ---
interface WordConfig {
  word: string;
}

const MAX_ATTEMPTS = 6;

// --- COMPONENTE VISUAL DEL AHORCADO (Escalable) ---
const HangmanFigure: React.FC<{ wrongCount: number }> = ({ wrongCount }) => {
  const partStyle = "absolute bg-slate-800 transition-all duration-500 shadow-sm";
  return (
    <div className="relative h-[16vw] w-[12vw] mx-auto border-b-[0.25vw] border-slate-200">
      {/* Estructura */}
      <div className="absolute bottom-0 left-[1vw] w-[0.25vw] h-full bg-slate-200" />
      <div className="absolute top-0 left-[1vw] w-[8vw] h-[0.25vw] bg-slate-200" />
      <div className="absolute top-0 right-[3vw] w-[0.25vw] h-[2vw] bg-slate-300" />

      {/* Cabeza */}
      <div className={`${partStyle} top-[2vw] right-[1.75vw] w-[2.75vw] h-[2.75vw] rounded-full border-[0.25vw] border-slate-800 ${wrongCount > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
      {/* Cuerpo */}
      <div className={`${partStyle} top-[4.7vw] right-[3.05vw] w-[0.3vw] h-[5vw] ${wrongCount > 1 ? 'opacity-100' : 'opacity-0'}`} />
      {/* Brazo Izquierdo */}
      <div className={`${partStyle} top-[5.5vw] right-[3.05vw] w-[0.3vw] h-[3vw] origin-bottom rotate-45 ${wrongCount > 2 ? 'opacity-100' : 'opacity-0'}`} />
      {/* Brazo Derecho */}
      <div className={`${partStyle} top-[5.5vw] right-[3.05vw] w-[0.3vw] h-[3vw] origin-bottom -rotate-45 ${wrongCount > 3 ? 'opacity-100' : 'opacity-0'}`} />
      {/* Pierna Izquierda */}
      <div className={`${partStyle} top-[9.5vw] right-[3.05vw] w-[0.3vw] h-[3.5vw] origin-top rotate-45 ${wrongCount > 4 ? 'opacity-100' : 'opacity-0'}`} />
      {/* Pierna Derecha */}
      <div className={`${partStyle} top-[9.5vw] right-[3.05vw] w-[0.3vw] h-[3.5vw] origin-top -rotate-45 ${wrongCount > 5 ? 'opacity-100' : 'opacity-0'}`} />
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    const onlyLetters = value.replace(/[^A-ZÑ]/g, '');
    setNewWordInput(onlyLetters);
  };

  const addLetter = useCallback((letter: string) => {
    if (!activeWord || isGameOver || guessedLetters.has(letter)) return;
    setGuessedLetters(prev => new Set([...prev, letter]));
  }, [activeWord, isGameOver, guessedLetters]);

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
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 relative antialiased overflow-hidden">
      
      {/* MODAL DE ESTADO ESCALABLE */}
      {isGameOver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-[2vw] bg-slate-900/40 backdrop-blur-md">
          <div className={`relative p-[4vw] rounded-[4vw] shadow-2xl text-center max-w-[40vw] w-full border-[0.3vw] animate-in zoom-in duration-300 ${isWinner ? "bg-emerald-500 border-emerald-300 shadow-emerald-500/50" : "bg-red-500 border-red-300 shadow-red-500/50"}`}>
            <h2 className="text-[4vw] font-black text-white uppercase mb-[1vw] tracking-tighter drop-shadow-md">
              {isWinner ? "¡LO LOGRASTE!" : "¡AHORCADO!"}
            </h2>
            <p className="text-white/90 text-[1.5vw] font-bold mb-[2.5vw] uppercase">
              {isWinner ? "Eres un experto ✨" : `La palabra era: ${wordToGuess} ⌛`}
            </p>
            <button onClick={resetAfterModal} className="bg-white text-slate-900 px-[3vw] py-[1.2vw] rounded-[1.5vw] font-black text-[1.2vw] hover:scale-105 active:scale-95 transition-transform shadow-lg">
              CONTINUAR
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 w-full px-[5vw] py-[3vw] flex flex-col gap-[3vw]">
        
        {/* HEADER ESCALABLE */}
        <header className="grid grid-cols-[1.2fr_2fr_1.2fr] gap-[2vw] items-center w-full">
          <div className="flex flex-col items-start gap-[0.5vw]">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[22vw] object-contain" />
            <div className="text-[4vw] font-black text-[#871F80] leading-none">
              {attemptsLeft} <span className="text-[1.2vw] text-slate-400 uppercase">Vidas</span>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[32vw] h-auto object-contain" />
          </div>

          <div className="flex flex-col items-end">
             <Link to="/" className="group text-slate-400 font-bold hover:text-[#871F80] transition-colors uppercase tracking-widest text-[0.8vw]">
                ← VOLVER AL MENÚ
             </Link>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-[2.5vw]">
          
          {/* ASIDE: PALABRA OCULTA */}
          <aside className="col-span-4 space-y-[1.5vw]">
            <div className="bg-white/80 backdrop-blur-sm rounded-[2.5vw] p-[2vw] border border-white shadow-xl min-h-[12vw]">
              <h3 className="text-[0.7vw] font-black text-slate-400 mb-[1.5vw] uppercase tracking-[0.3em]">Reto Actual</h3>
              
              {!activeWord ? (
                <div className="text-center py-[2.5vw] border-[0.15vw] border-dashed border-slate-100 rounded-[1.5vw]">
                  <p className="text-slate-400 font-bold text-[0.9vw]">Esperando palabra válida...</p>
                </div>
              ) : (
                <div className="p-[1.5vw] rounded-[1.5vw] border-[0.15vw] border-[#871F80] bg-[#871F80]/5 flex flex-col items-center gap-[0.5vw]">
                  <span className="text-[0.6vw] font-bold text-[#871F80]/60 uppercase tracking-widest">Longitud</span>
                  <span className="text-[2.5vw] font-black text-[#871F80] tracking-[0.2em]">
                    {activeWord.word.replace(/./g, '*')}
                  </span>
                </div>
              )}
            </div>

            {/* FORMULARIO AGREGAR */}
            <div className="bg-[#871F80] rounded-[2.5vw] p-[2vw] text-white shadow-2xl relative overflow-hidden group">
              <h3 className="text-[0.7vw] font-black text-white/60 mb-[1.5vw] uppercase tracking-[0.3em]">Nueva Partida</h3>
              <div className="space-y-[1vw] relative z-10">
                <input 
                  type="password" 
                  placeholder="SOLO LETRAS..."
                  value={newWordInput}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && startNewGame()}
                  className="w-full bg-white/10 border border-white/20 rounded-[0.8vw] px-[1vw] py-[0.8vw] outline-none placeholder:text-white/40 font-bold focus:bg-white/20 transition-all uppercase text-[0.9vw]"
                />
                <button 
                  onClick={startNewGame}
                  className="w-full bg-white text-[#871F80] py-[0.8vw] rounded-[0.8vw] font-black text-[0.9vw] hover:bg-slate-100 active:scale-95 transition-all shadow-lg"
                >
                  ¡COMENZAR JUEGO!
                </button>
              </div>
            </div>
          </aside>

          {/* ÁREA DE JUEGO */}
          <section className="col-span-8">
            <div className="bg-white p-[2.5vw] rounded-[3.5vw] shadow-2xl border border-slate-100 min-h-[35vw] flex flex-col items-center justify-between">
              
              <div className="py-[1vw]">
                <HangmanFigure wrongCount={wrongLetters.length} />
              </div>

              <div className="flex flex-wrap justify-center gap-[1vw] py-[2vw]">
                {activeWord ? (
                  wordToGuess.split('').map((letter, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className={`text-[4vw] font-black text-slate-800 transition-all ${guessedLetters.has(letter) || isLoser ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[1vw]'}`}>
                        {letter}
                      </span>
                      <div className={`h-[0.4vw] w-[3vw] rounded-full mt-[0.5vw] ${guessedLetters.has(letter) ? 'bg-[#871F80]' : 'bg-slate-200'}`} />
                    </div>
                  ))
                ) : (
                  <div className="text-center">
                    <p className="text-[#871F80] font-black text-[2vw] mb-[0.5vw]">MODO DESAFÍO</p>
                    <p className="text-slate-300 font-bold text-[1vw]">Ingresa una palabra para empezar</p>
                  </div>
                )}
              </div>

              {/* TECLADO VIRTUAL ESCALABLE */}
              <div className="grid grid-cols-10 gap-[0.5vw] w-full max-w-[40vw]">
                {KEYS.map(key => {
                  const isUsed = guessedLetters.has(key);
                  const isCorrect = isUsed && wordToGuess.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => addLetter(key)}
                      disabled={isUsed || !activeWord || isGameOver}
                      className={`py-[0.8vw] rounded-[0.8vw] font-black text-[0.8vw] transition-all shadow-sm
                        ${isCorrect ? 'bg-emerald-500 text-white' : 
                          isUsed ? 'bg-slate-100 text-slate-300' : 
                          'bg-white border-[0.1vw] border-slate-100 hover:border-[#871F80] hover:text-[#871F80] active:scale-90'}
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