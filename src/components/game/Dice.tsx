import React from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface DiceProps {
  value: number;
  isRolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

export const Dice: React.FC<DiceProps> = ({ value, isRolling, onRoll, disabled }) => {
  const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const CurrentIcon = DiceIcons[(value || 1) - 1];

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div 
        className={`w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-200 transition-all duration-300
          ${isRolling ? 'animate-dice-roll' : 'hover:scale-105 active:scale-95'}
          ${disabled ? 'opacity-40 grayscale pointer-events-none' : 'cursor-pointer'}
        `}
        onClick={!disabled && !isRolling ? onRoll : undefined}
      >
        <CurrentIcon className={`w-8 h-8 md:w-10 md:h-10 ${isRolling ? 'text-primary' : 'text-slate-800'}`} strokeWidth={2.5} />
      </div>
      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className="w-full py-3 bg-primary text-white font-black rounded-xl shadow-md shadow-primary/20 hover:shadow-primary/40 disabled:opacity-30 disabled:shadow-none transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
};
