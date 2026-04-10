import { GameManager } from '@/components/game/GameManager';

export default function Home() {
  return (
    <main className="fixed-layout bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 flex flex-col min-h-0">
        <header className="py-2 px-4 md:py-4 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-9 md:h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg rotate-3">
               <span className="text-white font-black text-sm md:text-xl">S</span>
            </div>
            <div>
              <h1 className="text-base md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                SNAKE <span className="text-primary">&</span> LADDER
              </h1>
            </div>
          </div>
          <div className="hidden sm:block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Rush Edition
          </div>
        </header>

        <div className="flex-1 min-h-0 relative">
          <GameManager />
        </div>
      </div>
    </main>
  );
}