import { useEffect, useState } from 'react';

export default function GameScreenWrapper({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 1500;
      const scaleY = window.innerHeight / 1000;
      setScale(Math.min(scaleX, scaleY)); 
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black overflow-hidden">
      <div
        style={{
          width: '1500px',
          height: '1000px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
        className="relative shadow-2xl overflow-hidden bg-[#F8FAFC]"
      >
         {children}
      </div>
    </div>
  );
}