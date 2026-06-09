import { ACTS } from '../data/storyLogic';

const ACT_LABELS = {
   [ACTS.ACT_1]: { number: 'I', name: 'The Awakening' },
   [ACTS.ACT_2]: { number: 'II', name: 'The Coalition Scrap' },
   [ACTS.ACT_3]: { number: 'III', name: "The Mimic's Chasm" },
   [ACTS.ACT_4]: { number: 'IV', name: 'The Conclusion' },
};

export default function ActIndicator({ act, loopCount }) {
   const label = ACT_LABELS[act];
   if (!label) return null;

   return (
      <div className="flex items-center gap-2">
         <span className="status-badge text-dungeon-ink">
            Act {label.number}
         </span>
         <span className="hidden sm:inline text-dungeon-muted text-xs font-lora italic">
            {label.name}
         </span>
         {loopCount > 0 && (
            <span
               title={`You have been cursed ${loopCount} time${loopCount > 1 ? 's' : ''}`}
               className="status-badge text-dungeon-crimson ml-1"
            >
               ✦ Cursed ×{loopCount}
            </span>
         )}
      </div>
   );
}