/**
 * POST /api/transcribe
 *
 * Receives: multipart/form-data with an "audio" field (webm blob)
 * Returns:  { transcript: string }
 *
 * Uses Groq Whisper (whisper-large-v3) — faster and cheaper than OpenAI.
 *
 * Setup:
 *   npm install groq-sdk multer
 *   GROQ_API_KEY=... in your .env
 */

import express from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── OpenAI alternative (uncomment + npm install openai to use) ──
// import OpenAI from 'openai';
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file received.' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    console.log(`[Transcribe] Received audio — ${req.file.size} bytes`);

    // Groq requires a File object, not a raw Buffer
    const file = new File(
      [req.file.buffer],
      'recording.webm',
      { type: req.file.mimetype || 'audio/webm' }
    );

    const result = await groq.audio.transcriptions.create({
      model: 'whisper-large-v3',
      file,
      response_format: 'json',
      language: 'en',       // force English; remove if you want auto-detect
    });

    console.log(`[Transcribe] → "${result.text}"`);
    return res.json({ transcript: result.text });

  } catch (err) {
    console.error('[Transcribe Error]', err);

    // Surface a clearer message if the API key is missing/invalid
    if (err?.status === 401 || err?.code === 'invalid_api_key') {
      return res.status(500).json({ error: 'Invalid or missing GROQ_API_KEY.' });
    }

    res.status(500).json({ error: 'Transcription failed.' });
  }
});

export default router;