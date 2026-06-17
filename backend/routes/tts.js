/**
 * POST /api/tts
 *
 * Receives: { text: string, voiceId?: string }
 * Returns:  audio/mpeg stream
 *
 * Uses ElevenLabs eleven_turbo_v2 (lowest latency model).
 * The response is a raw audio stream that api.js reads as a Blob
 * and GameContext.jsx plays with new Audio(objectURL).
 *
 * Setup:
 *   npm install elevenlabs
 *   ELEVENLABS_API_KEY=...    in your .env
 *   ELEVENLABS_VOICE_ID=...   in your .env  (see voice library below)
 *
 * Recommended DM voices in the ElevenLabs library:
 *   pNInz6obpgDQGcFmaJgB  — Adam      (deep, authoritative)
 *   VR6AewLTigWG4xSOukaG  — Arnold    (gravelly, dark)
 *   GBv7mTt0atIp3Br8iCZE  — Thomas    (cinematic baritone)
 *
 * ── Integration note for GameContext.jsx ───────────────────────
 * Uncomment the TTS block (~line 75) and replace the comment with:
 *
 *   const ttsResult = await synthesizeSpeech(dmNarration);
 *   if (!ttsResult.mock) {
 *     const audioUrl = URL.createObjectURL(ttsResult.audioBlob);
 *     const audio = new Audio(audioUrl);
 *     audio.onended = () => URL.revokeObjectURL(audioUrl); // clean up
 *     await audio.play();
 *   }
 * ───────────────────────────────────────────────────────────────
 */

import express from 'express';
import { ElevenLabsClient } from 'elevenlabs';

const router = express.Router();

// Adam — deep and authoritative; swap via env var or per-request voiceId
const DEFAULT_VOICE = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

router.post('/', async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    if (!text) return res.status(400).json({ error: 'No text provided.' });

    const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

    const targetVoice = voiceId || DEFAULT_VOICE;
    console.log(`[TTS] ${text.length} chars → voice ${targetVoice}`);

    const audioStream = await elevenlabs.textToSpeech.convert(targetVoice, {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8,
      },
    });

    console.log('[TTS] Returned type:', typeof audioStream);
    console.log('[TTS] Constructor:', audioStream?.constructor?.name);
    console.log('[TTS] Keys:', Object.keys(audioStream || {}));

    return res.json({
      debug: true,
      type: typeof audioStream,
      constructor: audioStream?.constructor?.name,
    });

  } catch (err) {
  console.error('[TTS Error Full]', err);

  if (err.body) {
    try {
      const reader = err.body.getReader();
      const decoder = new TextDecoder();

      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
      }

      console.error('[TTS Error Body]', text);
    } catch (e) {
      console.error('[TTS Error Body Parse Failed]', e);
    }
  }

  res.status(err.statusCode || 500).json({
    error: 'TTS synthesis failed.',
    detail: err.message,
    statusCode: err.statusCode,
  });
}
});

export default router;