import { useState, useRef } from 'react';
import { useMicrophone } from '../hooks/useMicrophone';
import { useGame } from '../context/GameContext';

export default function MicButton() {
   const { state, processAction, resetGame, setStatus } = useGame();
   const { status, outcome } = state;

   const { isRecording, audioLevel, hasPermission, startRecording, stopRecording } = useMicrophone();
   const [devText, setDevText] = useState('');
   const [showDev, setShowDev] = useState(false);
   const inputRef = useRef(null);

   const isIdle = status === 'idle';
   const isListening = status === 'listening';
   const isProcessing = status === 'processing';
   const isNarrating = status === 'narrating';
   const isOver = status === 'gameOver';
   const isVictory = status === 'victory';
   const isDisabled = isProcessing || isNarrating;

   // ── Mic toggle ───────────────────────────────────────────────
   async function handleMicClick() {
      if (isDisabled) return;

      if (isListening) {
         const blob = await stopRecording();
         processAction(blob, '');
      } else {
         await startRecording();
         setStatus('listening'); // ← tell game context we're recording
      }
   }

   // ── Dev text submit ──────────────────────────────────────────
   function handleDevSubmit(e) {
      e.preventDefault();
      if (!devText.trim() || isDisabled) return;
      processAction(null, devText.trim());
      setDevText('');
   }

   // ── Ring scale driven by audio level ─────────────────────────
   const ringScale = 1 + audioLevel * 0.35;

   // ── End-state UI ─────────────────────────────────────────────
   if (isOver || isVictory) {
      return (
         <div className="flex flex-col items-center gap-4 py-4">
            <p className={`font-cinzel text-sm tracking-widest uppercase ${isVictory ? 'text-dungeon-moss-bright' : 'text-dungeon-crimson-bright'}`}>
               {isVictory ? '— You are free —' : '— Your journey ends —'}
            </p>
            <button
               onClick={resetGame}
               className="
            font-cinzel text-xs tracking-[0.2em] uppercase
            px-6 py-2 rounded-sm stone-border
            bg-dungeon-surface text-dungeon-torch
            hover:bg-dungeon-border hover:text-dungeon-torch-glow
            transition-all duration-300
          "
            >
               Begin Again
            </button>
         </div>
      );
   }

   return (
      <div className="flex flex-col items-center gap-4 pb-2 pt-1">

         {/* ── Transcript echo ─────────────────────────────────── */}
         {state.transcript && (
            <p className="text-dungeon-ink font-lora italic text-sm max-w-sm text-center line-clamp-2">
               "{state.transcript}"
            </p>
         )}

         {/* ── Status label ────────────────────────────────────── */}
         <p className="status-badge text-dungeon-ink h-4">
            {isListening && 'Listening...'}
            {isProcessing && 'Processing...'}
            {isNarrating && 'Narrating...'}
            {isIdle && (hasPermission === false ? 'Mic unavailable — use text below' : '')}
         </p>

         {/* ── Mic button ──────────────────────────────────────── */}
         <div className="relative flex items-center justify-center">

            {/* Audio level ring */}
            {isListening && (
               <div
                  className="absolute rounded-full bg-dungeon-crimson/20 transition-transform duration-75"
                  style={{
                     width: 72, height: 72,
                     transform: `scale(${ringScale})`,
                  }}
               />
            )}

            {/* Outer glow ring */}
            {isListening && (
               <div className="absolute w-16 h-16 rounded-full animate-pulse-torch bg-dungeon-crimson/10" />
            )}

            <button
               onClick={handleMicClick}
               disabled={isDisabled}
               aria-label={isListening ? 'Stop recording' : 'Start recording'}
               className={`
            relative z-10 w-14 h-14 rounded-full
            flex items-center justify-center
            transition-all duration-200
            ${isDisabled
                     ? 'opacity-40 cursor-not-allowed bg-dungeon-surface border border-dungeon-border'
                     : isListening
                        ? 'bg-dungeon-crimson border border-dungeon-crimson-bright torch-glow cursor-pointer scale-110'
                        : 'bg-dungeon-surface border border-dungeon-torch/60 hover:border-dungeon-torch hover:torch-glow cursor-pointer hover:scale-105'
                  }
          `}
            >
               {isListening ? (
                  /* Stop icon */
                  <span className="w-4 h-4 rounded-sm bg-dungeon-parchment block" />
               ) : isProcessing ? (
                  /* Spinner */
                  <svg className="w-5 h-5 animate-spin text-dungeon-torch" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
               ) : (
                  /* Mic icon */
                  <svg className="w-5 h-5 text-dungeon-torch" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-7 9h2a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.93V21h2v2H9v-2h2v-2.07A7 7 0 0 1 5 12z" />
                  </svg>
               )}
            </button>
         </div>

         {/* ── Dev mode toggle + text input ────────────────────── */}
         <div className="flex flex-col items-center gap-2 w-full max-w-sm">
            <button
               onClick={() => { setShowDev(v => !v); setTimeout(() => inputRef.current?.focus(), 50); }}
               className="status-badge text-dungeon-muted hover:text-dungeon-ink transition-colors"
            >
               {showDev ? '▲ hide text input' : '▼ dev: type action'}
            </button>

            {showDev && (
               <form onSubmit={handleDevSubmit} className="flex w-full gap-2 animate-slide-up">
                  <input
                     ref={inputRef}
                     value={devText}
                     onChange={e => setDevText(e.target.value)}
                     disabled={isDisabled}
                     placeholder="Type your action here…"
                     className="
                flex-1 bg-dungeon-stone border border-dungeon-border rounded-sm
                px-3 py-2 text-sm font-lora text-dungeon-parchment
                placeholder:text-dungeon-muted
                focus:outline-none focus:border-dungeon-torch/60
                disabled:opacity-40
              "
                  />
                  <button
                     type="submit"
                     disabled={isDisabled || !devText.trim()}
                     className="
                font-cinzel text-xs tracking-widest uppercase
                px-4 py-2 rounded-sm stone-border
                bg-dungeon-surface text-dungeon-torch
                hover:bg-dungeon-border
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
              "
                  >
                     Act
                  </button>
               </form>
            )}
         </div>
      </div>
   );
}