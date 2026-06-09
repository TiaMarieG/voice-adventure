/**
 * POST /api/transcribe
 *
 * Receives: multipart/form-data with an "audio" field (webm/ogg blob)
 * Returns:  { transcript: string, mock?: boolean }
 *
 * ── Integration point ──────────────────────────────────────────
 * Replace the mock block below with one of:
 *
 * A) OpenAI Whisper API
 *    npm install openai
 *    import OpenAI from 'openai';
 *    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *    const file  = new File([req.file.buffer], 'recording.webm', { type: 'audio/webm' });
 *    const result = await openai.audio.transcriptions.create({ model: 'whisper-1', file });
 *    return res.json({ transcript: result.text });
 *
 * B) Groq Whisper API (lower latency)
 *    npm install groq-sdk
 *    import Groq from 'groq-sdk';
 *    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
 *    const result = await groq.audio.transcriptions.create({
 *      model: 'whisper-large-v3', file: new File([req.file.buffer], 'rec.webm')
 *    });
 *    return res.json({ transcript: result.text });
 * ──────────────────────────────────────────────────────────────
 */

import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file received.' });
    }

    // ── TODO: Replace this mock with real Whisper integration ──
    console.log(`[Transcribe] Received audio — ${req.file.size} bytes`);

    // Mock: echo back a placeholder so the frontend knows STT isn't wired up yet
    return res.json({
      transcript: '',
      mock: true,
      message: 'Whisper STT not yet integrated. Use the text input below to test story logic.',
    });

  } catch (err) {
    console.error('[Transcribe Error]', err);
    res.status(500).json({ error: 'Transcription failed.' });
  }
});

export default router;