import React from 'react';
import { Cell } from './Cell';
import { PlayerToken } from './PlayerToken';
import { SNAKES_AND_LADDERS, getCellCoords } from '@/lib/game-constants';

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
}

interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({ players, currentPlayerIndex }) => {
  const renderVisuals = () => {
    return SNAKES_AND_LADDERS.map((sl, i) => {
      const start = getCellCoords(sl.start);
      const end = getCellCoords(sl.end);
      
      const x1 = start.col * 10 + 5;
      const y1 = (9 - start.row) * 10 + 5;
      const x2 = end.col * 10 + 5;
      const y2 = (9 - end.row) * 10 + 5;

      if (sl.type === 'ladder') {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(Math.floor(length / 4), 3);
        
        const norm = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / norm;
        const uy = dy / norm;
        const px = -uy;
        const py = ux;
        const railOffset = 1.4;

        return (
          <g key={`ladder-${i}`} className="opacity-80 drop-shadow-md">
            <line 
              x1={x1 + px * railOffset} y1={y1 + py * railOffset} 
              x2={x2 + px * railOffset} y2={y2 + py * railOffset} 
              stroke="#78350f" strokeWidth="0.8" strokeLinecap="round" 
            />
            <line 
              x1={x1 - px * railOffset} y1={y1 - py * railOffset} 
              x2={x2 - px * railOffset} y2={y2 - py * railOffset} 
              stroke="#78350f" strokeWidth="0.8" strokeLinecap="round" 
            />
            {Array.from({ length: steps }).map((_, stepIdx) => {
              const t = (stepIdx + 0.5) / steps;
              const rx = x1 + t * dx;
              const ry = y1 + t * dy;
              return (
                <line 
                  key={`rung-${i}-${stepIdx}`}
                  x1={rx + px * railOffset} y1={ry + py * railOffset} 
                  x2={rx - px * railOffset} y2={ry - py * railOffset} 
                  stroke="#92400e" strokeWidth="0.5" strokeLinecap="round"
                />
              );
            })}
          </g>
        );
      } else {
        const cpX1 = x1 + (x2 - x1) * 0.25 + (sl.start % 2 === 0 ? 6 : -6);
        const cpY1 = y1 + (y2 - y1) * 0.25;
        const cpX2 = x1 + (x2 - x1) * 0.75 + (sl.start % 2 === 0 ? -6 : 6);
        const cpY2 = y1 + (y2 - y1) * 0.75;
        
        return (
          <g key={`snake-${i}`} className="opacity-80 drop-shadow-sm">
            <path 
              d={`M ${x1} ${y1} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`}
              stroke="#16a34a"
              strokeWidth="0.5"
              fill="none"
              strokeLinecap="round"
            />
            <path 
              d={`M ${x1} ${y1} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`}
              stroke="#facc15"
              strokeWidth="0.2"
              fill="none"
              strokeDasharray="1, 1.5"
              strokeLinecap="round"
            />
            <circle cx={x1} cy={y1} r="1" fill="#15803d" />
          </g>
        );
      }
    });
  };

  return (
    <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 md:border-4 border-slate-100 dark:border-slate-800 overflow-hidden select-none aspect-square">
      <div className="grid grid-cols-10 grid-rows-10 w-full h-full absolute inset-0">
        {Array.from({ length: 10 }).reverse().map((_, r) => (
          <React.Fragment key={r}>
            {Array.from({ length: 10 }).map((_, c) => {
              const row = 9 - r;
              const col = c;
              let cellNum;
              if (row % 2 === 0) {
                cellNum = row * 10 + col + 1;
              } else {
                cellNum = row * 10 + (9 - col) + 1;
              }
              return <Cell key={cellNum} number={cellNum} />;
            })}
          </React.Fragment>
        ))}
      </div>

      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        {renderVisuals()}
      </svg>
      
      {players.map((p, idx) => (
        <PlayerToken 
          key={p.id}
          index={idx}
          cellNumber={p.position}
          color={p.color}
          label={p.name}
          isActive={currentPlayerIndex === idx}
        />
      ))}
    </div>
  );
};