import React from 'react';
import { getCellCoords } from '@/lib/game-constants';

interface PlayerTokenProps {
  cellNumber: number;
  color: string;
  label: string;
  isActive: boolean;
  index: number;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({ cellNumber, color, label, isActive, index }) => {
  const { row, col } = getCellCoords(cellNumber);
  
  const left = col * 10;
  const top = (9 - row) * 10;
  
  // Offset players so they don't overlap perfectly
  const offsetX = index === 0 ? 1 : 4;
  const offsetY = index === 0 ? 1 : 4;

  return (
    <div 
      className={`absolute w-[6%] h-[6%] rounded-full shadow-2xl border-2 border-white transition-all duration-700 ease-out flex items-center justify-center z-20 ${isActive ? 'scale-150 z-30 ring-4 ring-primary/20' : ''}`}
      style={{
        left: `${left + offsetX}%`,
        top: `${top + offsetY}%`,
        backgroundColor: color,
        transform: `translate3d(0, 0, 0)`,
      }}
    >
      <span className="text-[10px] font-black text-white">{label[0]}</span>
      {isActive && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping" />
      )}
    </div>
  );
};
