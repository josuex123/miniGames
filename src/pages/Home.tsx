import { Link } from 'react-router-dom';

// Importación de imágenes de juegos
import setGame from '../assets/games/SetWordGame.png';
import hangGame from '../assets/games/HangManGame.png';
import dynoGame from '../assets/games/DynoGame.png';
import tetrisGame from '../assets/games/TetrisGame.png';
import carsGame from '../assets/games/CarsGame.png';

// Importación de logos (ajusté la ruta para que coincida con la de assets)
import logoAlpha2 from '../assets/LogoAlphaGaming2.svg';
import logoCronex2 from '../assets/LogoCronex2.svg';

interface CardItem {
  id: number;
  title: string;
  path: string;
  imageUrl: string;
}

export default function Home() {
  const cards: CardItem[] = [
    { id: 1, title: 'Palabra rapida', path: '/game_set_word', imageUrl: setGame },
    { id: 2, title: 'Ahorcado', path: '/game_hang_man', imageUrl: hangGame },
    { id: 3, title: 'Carreras', path: '/game_cars', imageUrl: carsGame },
    { id: 4, title: 'Dinosaurio', path: '/game_dyno', imageUrl: dynoGame },
    { id: 5, title: 'Tetris', path: '/game_tetris', imageUrl: tetrisGame },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans">
      
      {/* HEADER CON LOGOS (Estilo GameCars) */}
      <header className="max-w-6xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-slate-200 pb-10">
        <div className="flex justify-center md:justify-start">
          <img src={logoCronex2} alt="Cronex" className="h-auto w-[200px] md:w-[280px] object-contain" />
        </div>
        
        <div className="flex justify-center items-center">
          <img src={logoAlpha2} alt="Alpha Gaming" className="w-[180px] md:w-[220px] h-auto object-contain" />
        </div>

        <div className="text-center md:text-right">
          <h1 className="text-sm font-black text-[#871F80] uppercase tracking-[0.3em]">
            Game Center
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase">Selecciona tu desafío</p>
        </div>
      </header>
      
      {/* Grid Responsivo de Juegos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {cards.map((card) => (
          <Link 
            key={card.id} 
            to={card.path} 
            className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100"
          >
            {/* Contenedor de Imagen */}
            <div className="aspect-video overflow-hidden">
              <img 
                src={card.imageUrl} 
                alt={card.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>

            {/* Texto inferior */}
            <div className="p-6 text-center bg-white">
              <span className="text-xl font-black text-slate-700 group-hover:text-[#871F80] transition-colors uppercase tracking-tight">
                {card.title}
              </span>
            </div>
            
            {/* Efecto de borde sutil al hacer hover */}
            <div className="absolute inset-0 border-4 border-transparent group-hover:border-[#871F80]/20 rounded-[2.5rem] pointer-events-none transition-colors" />
          </Link>
        ))}
      </div>

      {/* Footer decorativo */}
      {/* <footer className="mt-20 text-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">
        Alpha Gaming © 2024
      </footer> */}
    </div>
  );
}