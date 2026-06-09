import { useGame } from '../context/GameContext';
import ActIndicator from './ActIndicator';
import NarratorText from './NarratorText';
import MicButton from './MicButton';

export default function GameScreen() {
   const { state } = useGame();

   return (
      <div
         className="h-full w-full flex flex-col"
         style={{
            background: `
          radial-gradient(ellipse at 50% 0%, rgba(200,118,58,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.8) 0%, transparent 70%),
          #080705
        `,
         }}
      >
         {/* ── Header ─────────────────────────────────────────────── */}
         <header className="flex items-center justify-between px-6 py-4 border-b border-dungeon-border/60">
            <h1
               className="font-cinzel text-dungeon-torch torch-glow-text text-lg sm:text-xl tracking-widest animate-flicker"
               style={{ fontWeight: 700 }}
            >
               Voice to Venture
            </h1>
            <ActIndicator act={state.currentAct} loopCount={state.loopCount} />
         </header>

         {/* ── Narration area ─────────────────────────────────────── */}
         <main className="flex-1 overflow-hidden px-4 sm:px-8 py-6 flex flex-col gap-4">

            {/* Decorative top rule */}
            <div className="flex items-center gap-3">
               <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dungeon-muted/40 to-transparent" />
               <span className="text-dungeon-muted text-xs font-cinzel tracking-[0.3em]">✦</span>
               <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dungeon-muted/40 to-transparent" />
            </div>

            {/* Main narration pane — fills available space */}
            <NarratorText />

            {/* Decorative bottom rule */}
            <div className="flex items-center gap-3">
               <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dungeon-muted/40 to-transparent" />
               <span className="text-dungeon-muted text-xs font-cinzel tracking-[0.3em]">✦</span>
               <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dungeon-muted/40 to-transparent" />
            </div>
         </main>

         {/* ── Controls footer ────────────────────────────────────── */}
         <footer className="border-t border-dungeon-border/60 px-4 pb-6 pt-4">
            <MicButton />
         </footer>
      </div>
   );
}