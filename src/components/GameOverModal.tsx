interface GameOverModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  score?: number;
  onRetry: () => void;
  onMenu?: () => void;
  variant?: 'lose' | 'win';
}

export default function GameOverModal({
  isOpen,
  title,
  message,
  score,
  onRetry,
  onMenu,
  variant = 'lose',
}: GameOverModalProps) {
  if (!isOpen) return null;

  const bgColor = variant === 'win' ? 'bg-emerald-500 border-emerald-300 shadow-emerald-500/50' : 'bg-red-500 border-red-300 shadow-red-500/50';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-[2vw] bg-slate-900/40 backdrop-blur-md">
      <div className={`relative p-[4vw] rounded-[4vw] shadow-2xl text-center max-w-[40vw] w-full border-[0.3vw] animate-in zoom-in duration-300 ${bgColor}`}>
        <h2 className="text-[4vw] font-black text-white uppercase mb-[1vw] tracking-tighter drop-shadow-md">
          {title}
        </h2>
        <p className="text-white/90 text-[1.5vw] font-bold mb-[2.5vw] uppercase">
          {message}
        </p>
        {score !== undefined && (
          <p className="text-white/80 text-[1.2vw] font-bold mb-[2vw] uppercase">
            Puntaje: {score}
          </p>
        )}
        <div className="flex flex-col gap-[1vw] items-center">
          <button
            onClick={onRetry}
            className="bg-white text-slate-900 px-[3vw] py-[1.2vw] rounded-[1.5vw] font-black text-[1.2vw] hover:scale-105 active:scale-95 transition-transform shadow-lg"
          >
            VOLVER A JUGAR
          </button>
          {onMenu && (
            <button
              onClick={onMenu}
              className="text-white/80 underline font-bold text-[1vw] hover:text-white transition-colors"
            >
              IR AL MENÚ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
