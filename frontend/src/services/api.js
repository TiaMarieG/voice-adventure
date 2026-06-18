/**
 * services/api.js
 *
 * All communication with the Express backend.
 * Each function maps to one route:
 *   transcribeAudio  →  POST /api/transcribe
 *   getDMResponse    →  POST /api/dm
 *   synthesizeSpeech →  POST /api/tts
 *
 * While the backend routes return { mock: true }, these functions
 * pass that flag through so the game context can handle the fallback.
 */

const BASE = '/api';

// ── STT ──────────────────────────────────────────────────────────
export async function transcribeAudio(audioBlob) {
   const formData = new FormData();
   formData.append('audio', audioBlob, 'recording.webm');

   const res = await fetch(`${BASE}/transcribe`, { method: 'POST', body: formData });
   if (!res.ok) throw new Error(`STT ${res.status}: ${await res.text()}`);
   return res.json();
}

// ── LLM DM ───────────────────────────────────────────────────────
export async function getDMResponse({ transcript, history, act, systemPrompt }) {
   const res = await fetch(`${BASE}/dm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, history, act, systemPrompt }),
   });
   if (!res.ok) throw new Error(`DM ${res.status}: ${await res.text()}`);
   return res.json();
}

// ── TTS ───────────────────────────────────────────────────────────
export async function synthesizeSpeech(text, voiceId) {
   const res = await fetch(`${BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId }),
   });
   if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);

   const contentType = res.headers.get('content-type') || '';
   if (contentType.includes('audio')) {
      const audioBlob = await res.blob();
      return { mock: false, audioBlob };
   }
   return res.json();
}