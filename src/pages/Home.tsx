import { Link } from 'react-router-dom';
import setGame from '../assets/games/SetWordGame.png';
import hangGame from '../assets/games/HangManGame.png';
import dynoGame from '../assets/games/DynoGame.png';
import tetrisGame from '../assets/games/TetrisGame.png';
import carsGame from '../assets/games/CarsGame.png';
import tecGame from '../assets/games/TeclasGame.jpg';
import logoAlpha2 from '../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../assets/LogoCronex2.svg';

interface CardItem { id: number; title: string; path: string; imageUrl: string; }

export default function Home() {
  const cards: CardItem[] = [
    { id: 1, title: 'Palabra Rapida', path: '/game_set_word', imageUrl: setGame },
    { id: 2, title: 'Ahorcado', path: '/game_hang_man', imageUrl: hangGame },
    { id: 3, title: 'Carreras', path: '/game_cars', imageUrl: carsGame },
    { id: 4, title: 'Dinosaurio', path: '/game_dyno', imageUrl: dynoGame },
    { id: 5, title: 'Tetris', path: '/game_tetris', imageUrl: tetrisGame },
    { id: 6, title: 'Lluvia de Teclas', path: '/game_letras', imageUrl: tecGame },
  ];

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      
      {/* Contenedor principal 3:2 fijo */}
      <main className="w-full max-w-[100vw] max-h-[100vh] aspect-[3/2] bg-[#F8FAFC] flex flex-col items-center p-[2vw] relative overflow-hidden">
        
        {/* HEADER: Reducido un poco para dar aire */}
        <header className="w-full grid grid-cols-[1fr_2fr_1fr] items-center border-b-[0.1vw] border-slate-200 pb-[1.5vw] mb-[2vw] shrink-0">
          <div className="flex flex-col items-start">
            <img src={logoCronex2} alt="Cronex" className="h-auto w-[12vw] object-contain" />
          </div>

          <div className="flex justify-center">
            <img src={logoAlpha2} alt="Alpha Gaming" className="w-[25vw] h-auto object-contain" />
          </div>

          <div className="text-right flex flex-col justify-center">
            <h1 className="text-[2vw] font-black text-[#871F80] uppercase tracking-[0.1em] leading-none">
              Game Center
            </h1>
            <p className="text-slate-400 text-[0.7vw] font-bold uppercase mt-[0.3vw]">
              Selecciona tu desafío
            </p>
          </div>
        </header>

        {/* CONTENEDOR DE CARTAS CON SCROLL INTERNO SI ES NECESARIO */}
        <section className="w-full flex-grow overflow-y-auto px-[1vw] scrollbar-hide">
          <div className="grid grid-cols-3 gap-[2vw] w-full py-[1vw]">
            {cards.map((card) => (
              <Link
                key={card.id}
                to={card.path}
                className="group relative bg-white rounded-[1.2vw] overflow-hidden shadow-[0_0.5vw_1.5vw_rgba(0,0,0,0.05)] hover:shadow-[0_1.5vw_3vw_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-[0.4vw] border border-slate-100 flex flex-col"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <div className="p-[1vw] text-center bg-white">
                  <span className="text-[1.2vw] font-black text-slate-700 group-hover:text-[#871F80] transition-colors uppercase">
                    {card.title}
                  </span>
                </div>
                <div className="absolute inset-0 border-[0.3vw] border-transparent group-hover:border-[#871F80]/20 rounded-[1.2vw] pointer-events-none" />
              </Link>
            ))}
          </div>
        </section>

        {/* FOOTER: Pegado abajo */}
        <footer className="mt-[1.5vw] py-[0.5vw] text-slate-400 text-[0.7vw] font-bold uppercase tracking-[0.5em] shrink-0">
          Alpha Gaming © 2026
        </footer>
      </main>
    </div>
  );
}