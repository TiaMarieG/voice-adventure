import { createContext, useContext, useReducer, useCallback } from 'react';
import { ACTS, OUTCOMES, evaluateAction, narrations, DM_SYSTEM_PROMPT } from '../data/storyLogic';
import { transcribeAudio, getDMResponse, synthesizeSpeech } from '../services/api';

// ── Context ──────────────────────────────────────────────────────
const GameContext = createContext(null);

// ── Initial State ────────────────────────────────────────────────
const initialState = {
   currentAct: ACTS.ACT_1,
   narration: narrations[ACTS.ACT_1].intro,
   transcript: '',
   status: 'idle',
   outcome: null,
   history: [],
   loopCount: 0, 
};

// ── Reducer ──────────────────────────────────────────────────────
function gameReducer(state, action) {
   switch (action.type) {
      case 'SET_STATUS':
         return { ...state, status: action.payload };

      case 'SET_NARRATION':
         return { ...state, narration: action.payload };

      case 'SET_TRANSCRIPT':
         return { ...state, transcript: action.payload };

      case 'ADVANCE': {
         const { narration, nextAct, outcome, userText, dmText } = action.payload;
         const newHistory = [
            ...state.history,
            { role: 'user', content: userText },
            { role: 'assistant', content: dmText },
         ];
         return {
            ...state,
            narration,
            outcome,
            history: newHistory,
            currentAct: nextAct || state.currentAct,
            status: outcome === OUTCOMES.GAME_OVER ? 'gameOver'
               : outcome === OUTCOMES.VICTORY ? 'victory'
                  : 'narrating',
         };
      }

      case 'LOOP_RESTART':
         return {
            ...initialState,
            narration: action.payload.narration,
            loopCount: state.loopCount + 1,
            status: 'narrating',
         };

      case 'RESET':
         return { ...initialState };

      default:
         return state;
   }
}

// ── Provider ─────────────────────────────────────────────────────
export function GameProvider({ children }) {
   const [state, dispatch] = useReducer(gameReducer, initialState);

   /**
    * processAction — the core pipeline for each player turn.
    *
    * audioBlob: Blob from the microphone (null when using text input in dev mode)
    * textOverride: string used in dev mode instead of STT transcription
    */
   const processAction = useCallback(async (audioBlob, textOverride = '') => {
      dispatch({ type: 'SET_STATUS', payload: 'processing' });

      try {
         // ── Step 1: Transcribe ──────────────────────────────────
         let transcript = textOverride;

         if (!transcript && audioBlob) {
            const sttResult = await transcribeAudio(audioBlob);

            if (sttResult.mock) {
               dispatch({ type: 'SET_STATUS', payload: 'idle' });
               dispatch({
                  type: 'SET_NARRATION',
                  payload: state.narration + '\n\n[Dev: Whisper STT not yet connected — use the text input below to test story logic.]',
               });
               return;
            }
            transcript = sttResult.transcript;
         }

         if (!transcript.trim()) {
            dispatch({ type: 'SET_STATUS', payload: 'idle' });
            return;
         }

         dispatch({ type: 'SET_TRANSCRIPT', payload: transcript });

         // ── Step 2: Get DM response ─────────────────────────────:
         const dmResult = await getDMResponse({
            transcript,
            history: state.history,
            act: state.currentAct,
            systemPrompt: DM_SYSTEM_PROMPT,
         });

         const {
            response: dmNarration,
            outcome,
            nextAct,
         } = dmResult;

         const ttsResult = await synthesizeSpeech(dmNarration);

         if (!ttsResult.mock) {
            const audioUrl = URL.createObjectURL(ttsResult.audioBlob);
            const audio = new Audio(audioUrl);

            audio.onended = () => URL.revokeObjectURL(audioUrl);

            await audio.play();
         }

         // ── Step 4: Update game state ───────────────────────────
         if (outcome === OUTCOMES.LOOP) {
            dispatch({
               type: 'LOOP_RESTART',
               payload: { narration: dmNarration },
            });
            return;
         }

         dispatch({
            type: 'ADVANCE',
            payload: {
               narration: dmNarration,
               nextAct: outcome === OUTCOMES.REDIRECT ? state.currentAct : nextAct,
               outcome,
               userText: transcript,
               dmText: dmNarration,
            },
         });

      } catch (err) {
         console.error('[processAction]', err);
         dispatch({ type: 'SET_STATUS', payload: 'idle' });
      }
   }, [state.currentAct, state.history, state.narration]);

   const resetGame = useCallback(() => {
      dispatch({ type: 'RESET' });
   }, []);

   const setStatus = useCallback((status) => {
      dispatch({ type: 'SET_STATUS', payload: status });
   }, []);

   return (
      <GameContext.Provider value={{ state, processAction, resetGame, setStatus }}>
         {children}
      </GameContext.Provider>
   );
}

// ── Hook ─────────────────────────────────────────────────────────
export function useGame() {
   const ctx = useContext(GameContext);
   if (!ctx) throw new Error('useGame must be used within a GameProvider');
   return ctx;
}