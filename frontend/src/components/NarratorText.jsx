import { useTypewriter } from '../hooks/useTypewriter';
import { OUTCOMES } from '../data/storyLogic';
import { useGame } from '../context/GameContext';

// Colour the narration border based on what just happened
const outcomeStyles = {
   [OUTCOMES.GAME_OVER]: 'border-dungeon-crimson/50',
   [OUTCOMES.LOOP]: 'border-dungeon-crimson/50',
   [OUTCOMES.VICTORY]: 'border-dungeon-moss-bright/50',
   [OUTCOMES.CONTINUE]: 'border-dungeon-torch/30',
   [OUTCOMES.REDIRECT]: 'border-dungeon-border',
   null: 'border-dungeon-border',
};

export default function NarratorText({ onTypingComplete }) {
   const { state, setStatus } = useGame();
   const { narration, outcome, status } = state;

   const { displayText, isTyping, skip } = useTypewriter(
      narration,
      26,
      () => {
         onTypingComplete?.();
         if (status === 'narrating') setStatus('idle');
      }
   );

   const borderColor = outcomeStyles[outcome] ?? 'border-dungeon-border';

   return (
      <div
         onClick={isTyping ? skip : undefined}
         className={`
        relative flex-1 overflow-y-auto rounded-sm stone-border border
        ${borderColor}
        bg-dungeon-stone/60 backdrop-blur-sm
        p-6 sm:p-8
        cursor-${isTyping ? 'pointer' : 'default'}
        transition-colors duration-700
      `}
         title={isTyping ? 'Click to skip' : ''}
      >
         {/* Subtle vignette */}
         <div className="pointer-events-none absolute inset-0 rounded-sm"
            style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)' }} />

         <p className="relative font-lora text-dungeon-parchment leading-relaxed text-base sm:text-lg">
            {displayText}
            {isTyping && <span className="typewriter-cursor" />}
         </p>

         {isTyping && (
            <p className="absolute bottom-3 right-4 text-dungeon-ink text-xs font-cinzel tracking-widest">
               click to skip
            </p>
         )}
      </div>
   );
}