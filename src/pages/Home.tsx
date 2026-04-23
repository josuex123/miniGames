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
    { id: 1, title: 'Palabra rapida', path: '/game_set_word', imageUrl: setGame },
    { id: 2, title: 'Ahorcado', path: '/game_hang_man', imageUrl: hangGame },
    { id: 3, title: 'Carreras', path: '/game_cars', imageUrl: carsGame },
    { id: 4, title: 'Dinosaurio', path: '/game_dyno', imageUrl: dynoGame },
    { id: 5, title: 'Tetris', path: '/game_tetris', imageUrl: tetrisGame },
    { id: 6, title: 'Juego de letras', path: '/game_letras', imageUrl: tecGame },
  ];

 return (
    /* Contenedor principal: Usamos h-screen para forzar el aspecto 1080 */
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-center p-[4vw]">
      
      {/* HEADER: Proporcional al ancho de pantalla */}
      <header className="w-full grid grid-cols-[1fr_2fr_1fr] items-center border-b-[0.2vw] border-slate-200 pb-[3vw] mb-[4vw] shrink-0">
        
        {/* LOGO IZQUIERDO: Escala con el ancho */}
        <div className="flex justify-start">
          <img
            src={logoCronex2}
            alt="Cronex"
            className="w-[10vw] h-auto object-contain" 
          />
        </div>

        {/* LOGO CENTRAL */}
        <div className="flex justify-center">
          <img
            src={logoAlpha2}
            alt="Alpha Gaming"
            className="w-[35vw] h-auto object-contain"
          />
        </div>

        {/* TEXTO DERECHO */}
        <div className="text-right flex flex-col justify-center">
          <h1 className="text-[3vw] font-black text-[#871F80] uppercase tracking-[0.1em] leading-none">
            Game Center
          </h1>
          <p className="text-slate-400 text-[1vw] font-bold uppercase mt-[0.5vw]">
            Selecciona tu desafío
          </p>
        </div>
      </header>

      {/* GRID: 3 columnas que escalan perfectamente */}
      <main className="w-full flex-grow flex items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3vw] w-full">
          {cards.map((card) => (
            <Link
              key={card.id}
              to={card.path}
              className="group relative bg-white rounded-[2vw] overflow-hidden shadow-[0_1vw_3vw_-1vw_rgba(0,0,0,0.1)] hover:shadow-[0_2vw_5vw_-1vw_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-[0.5vw] border border-slate-100 flex flex-col"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              <div className="p-[2vw] text-center bg-white">
                <span className="text-[1.8vw] font-black text-slate-700 group-hover:text-[#871F80] transition-colors uppercase">
                  {card.title}
                </span>
              </div>

              {/* Borde de hover escalable */}
              <div className="absolute inset-0 border-[0.4vw] border-transparent group-hover:border-[#871F80]/20 rounded-[2vw] pointer-events-none" />
            </Link>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-[4vw] text-slate-400 text-[1vw] font-bold uppercase tracking-[0.5em] shrink-0">
        Alpha Gaming © 2026
      </footer>
    </div>
  );
}