/**
 * POST /api/tts
 *
 * Receives: { text: string, voiceId?: string }
 * Returns:  audio/mpeg stream  (or { mock: true } during dev)
 *
 * ── Integration point ──────────────────────────────────────────
 * Replace the mock block below with ElevenLabs:
 *
 *   npm install elevenlabs
 *   import { ElevenLabsClient } from 'elevenlabs';
 *   const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
 *
 *   const audioStream = await elevenlabs.textToSpeech.convert(
 *     voiceId || process.env.ELEVENLABS_VOICE_ID,
 *     {
 *       text,
 *       model_id: 'eleven_turbo_v2',        // lowest latency model
 *       voice_settings: { stability: 0.4, similarity_boost: 0.8 },
 *     }
 *   );
 *
 *   res.setHeader('Content-Type', 'audio/mpeg');
 *   audioStream.pipe(res);
 *
 * Backup — Azure Cognitive Services TTS:
 *   npm install microsoft-cognitiveservices-speech-sdk
 *   (see Azure docs for streaming synthesis)
 * ──────────────────────────────────────────────────────────────
 */

import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided.' });
    }

    console.log(`[TTS] Synthesizing ${text.length} chars with voice: ${voiceId || 'default'}`);

    // ── TODO: Replace this mock with ElevenLabs integration ──
    return res.json({
      mock: true,
      text,
      message: 'TTS not yet integrated. Text is displayed on screen only.',
    });

  } catch (err) {
    console.error('[TTS Error]', err);
    res.status(500).json({ error: 'TTS synthesis failed.' });
  }
});

export default router;