import React from 'react';
import { getCellColor } from '@/lib/game-constants';

interface CellProps {
  number: number;
}

export const Cell: React.FC<CellProps> = ({ number }) => {
  return (
    <div 
      className={`relative w-full h-full border-[0.5px] border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all duration-300 ${getCellColor(number)}`}
      data-cell={number}
    >
      <span className="absolute top-1 left-1.5 text-[11px] md:text-[13px] font-black text-black dark:text-white z-0 opacity-80">
        {number}
      </span>
      
      {number === 100 && (
        <div className="absolute inset-0 flex items-center justify-center bg-accent/10">
          <span className="text-xl md:text-3xl animate-float">👑</span>
        </div>
      )}

      {number === 1 && (
        <div className="absolute bottom-1 right-1 opacity-20">
          <span className="text-[8px] font-black uppercase text-slate-900 dark:text-slate-100">GO</span>
        </div>
      )}
    </div>
  );
};