"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameBoard } from './GameBoard';
import { Dice } from './Dice';
import { SNAKES_AND_LADDERS, TOTAL_CELLS } from '@/lib/game-constants';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Undo2, Redo2, Trophy, Moon, Sun } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  isAI: boolean;
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  turnCount: number;
}

const WinnerCelebration = ({ winnerName, onRestart }: { winnerName: string, onRestart: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-500 p-4">
      <div className="relative bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-center space-y-8 max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="confetti" 
            style={{ 
              left: `${Math.random() * 100}%`, 
              backgroundColor: ['#2563eb', '#facc15', '#22c55e', '#ef4444'][Math.floor(Math.random() * 4)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }} 
          />
        ))}
        
        <div className="relative z-10 space-y-6">
          <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-lg" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em]">Game Over</h2>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
              {winnerName}<br />WINS!
            </h1>
          </div>

          <Button 
            onClick={onRestart} 
            className="w-full rounded-2xl py-8 text-xl font-black shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95"
          >
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export const GameManager: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'You', position: 1, color: '#2563eb', isAI: false },
    { id: 2, name: 'AI Bot', position: 1, color: '#dc2626', isAI: true },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [logs, setLogs] = useState<string[]>(['Welcome! Tap Roll to begin.']);
  const [turnCount, setTurnCount] = useState(1);
  const [gameMode, setGameMode] = useState<'ai' | 'pvp'>('ai');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [history, setHistory] = useState<GameState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const saveToHistory = useCallback((currentPlayers: Player[], currentIndex: number, currentTurn: number) => {
    const newState: GameState = {
      players: JSON.parse(JSON.stringify(currentPlayers)),
      currentPlayerIndex: currentIndex,
      turnCount: currentTurn,
    };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newState];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  useEffect(() => {
    if (history.length === 0) {
      saveToHistory(players, currentPlayerIndex, turnCount);
    }
  }, [saveToHistory, players, currentPlayerIndex, turnCount, history.length]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPlayers(prevState.players);
      setCurrentPlayerIndex(prevState.currentPlayerIndex);
      setTurnCount(prevState.turnCount);
      setHistoryIndex(prev => prev - 1);
      addLog("Undo: Went back one turn.");
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPlayers(nextState.players);
      setCurrentPlayerIndex(nextState.currentPlayerIndex);
      setTurnCount(nextState.turnCount);
      setHistoryIndex(prev => prev + 1);
      addLog("Redo: Restored turn.");
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  };

  const handleModeChange = (val: string) => {
    const mode = val as 'ai' | 'pvp';
    setGameMode(mode);
    const newPlayers = [
      { id: 1, name: mode === 'ai' ? 'You' : 'Player 1', position: 1, color: '#2563eb', isAI: false },
      { id: 2, name: mode === 'ai' ? 'AI Bot' : 'Player 2', position: 1, color: '#dc2626', isAI: mode === 'ai' },
    ];
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setTurnCount(1);
    setIsGameOver(false);
    setHistory([]);
    setHistoryIndex(-1);
    setLogs([`Mode: ${mode === 'ai' ? 'Vs AI' : '2 Players'}`]);
  };

  const playStepAnimation = async (playerId: number, from: number, to: number) => {
    for (let i = from + 1; i <= to; i++) {
      await new Promise(r => setTimeout(r, 100));
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position: i } : p));
    }
  };

  const nextTurn = (currentPlayers: Player[], nextIndex: number) => {
    setCurrentPlayerIndex(nextIndex);
    setTurnCount(prev => prev + 1);
    saveToHistory(currentPlayers, nextIndex, turnCount + 1);
  };

  const handleMove = async (roll: number) => {
    if (isGameOver) return;

    const player = players[currentPlayerIndex];
    const newPosition = player.position + roll;

    addLog(`${player.name} rolled a ${roll}.`);

    if (newPosition > TOTAL_CELLS) {
      addLog(`${player.name} needs exact roll.`);
      nextTurn(players, (currentPlayerIndex + 1) % players.length);
      return;
    }

    await playStepAnimation(player.id, player.position, newPosition);

    const sl = SNAKES_AND_LADDERS.find(item => item.start === newPosition);
    let finalPos = newPosition;

    if (sl) {
      await new Promise(r => setTimeout(r, 400));
      addLog(`${player.name} hit a ${sl.type}!`);
      finalPos = sl.end;
      const updatedPlayers = players.map(p => p.id === player.id ? { ...p, position: finalPos } : p);
      setPlayers(updatedPlayers);
    }

    if (finalPos === TOTAL_CELLS) {
      setIsGameOver(true);
      return;
    }

    nextTurn(players.map(p => p.id === player.id ? { ...p, position: finalPos } : p), (currentPlayerIndex + 1) % players.length);
  };

  const rollDice = () => {
    if (isRolling || isGameOver) return;
    setIsRolling(true);
    
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(roll);
      setIsRolling(false);
      handleMove(roll);
    }, 400);
  };

  const restartGame = () => {
    const resetPlayers = players.map(p => ({ ...p, position: 1 }));
    setPlayers(resetPlayers);
    setCurrentPlayerIndex(0);
    setIsGameOver(false);
    setTurnCount(1);
    setHistory([]);
    setHistoryIndex(-1);
    setLogs(['Game restarted!']);
    saveToHistory(resetPlayers, 0, 1);
  };

  useEffect(() => {
    if (gameMode === 'ai' && players[currentPlayerIndex].isAI && !isGameOver && !isRolling) {
      const timer = setTimeout(() => {
        rollDice();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIndex, isGameOver, isRolling, players, gameMode]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* Board Section: Centered and dynamic scaling */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-3 md:p-6 lg:p-8 relative">
        <div className="w-full h-full max-w-[min(100vw-2rem,100vh-16rem)] md:max-w-[min(100vw-28rem,100vh-8rem)] aspect-square relative z-0">
            <GameBoard players={players} currentPlayerIndex={currentPlayerIndex} />
            {isGameOver && (
              <WinnerCelebration 
                winnerName={players[currentPlayerIndex].name} 
                onRestart={restartGame} 
              />
            )}
        </div>
      </div>

      {/* Side/Bottom Panel: Fixed Dice with scrollable settings & logs */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 h-[45%] md:h-full overflow-hidden">
        
        {/* Header (Fixed) */}
        <div className="p-4 md:p-6 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">Control Center</h2>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8 text-slate-500 hover:text-primary">
                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={restartGame} className="rounded-full h-8 w-8 text-slate-500 hover:text-destructive">
                    <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>
          </div>
        </div>

        {/* Scrollable Middle: Mode, Stats, Undo/Redo, Logs */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
            <Tabs value={gameMode} onValueChange={handleModeChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl h-9 bg-slate-100 dark:bg-slate-800 p-1">
                    <TabsTrigger value="ai" className="rounded-lg font-bold text-[10px] uppercase">Vs AI</TabsTrigger>
                    <TabsTrigger value="pvp" className="rounded-lg font-bold text-[10px] uppercase">2 Player</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Turn</span>
                    <span className="text-[9px] font-bold text-slate-500">#{turnCount}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm" style={{ backgroundColor: players[currentPlayerIndex].color }} />
                    <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{players[currentPlayerIndex].name}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0 || isRolling || isGameOver} className="flex-1 rounded-xl h-9 border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase">
                    <Undo2 className="w-3 h-3 mr-1.5" /> Undo
                </Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1 || isRolling || isGameOver} className="flex-1 rounded-xl h-9 border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase">
                    <Redo2 className="w-3 h-3 mr-1.5" /> Redo
                </Button>
            </div>

            <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Game Logs</span>
                <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    {logs.map((log, i) => (
                        <div key={i} className={`text-[11px] font-bold leading-tight flex items-start gap-2 ${i === 0 ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-current opacity-30 shrink-0" />
                            <span>{log}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Dice Controls (Fixed Footer) */}
        <div className="p-4 md:p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <Dice 
                value={diceValue} 
                isRolling={isRolling} 
                onRoll={rollDice} 
                disabled={isGameOver || (gameMode === 'ai' && players[currentPlayerIndex].isAI)}
            />
        </div>
      </div>
    </div>
  );
};