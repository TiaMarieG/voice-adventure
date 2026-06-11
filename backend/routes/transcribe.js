/**
 * POST /api/transcribe
 *
 * Receives: multipart/form-data with an "audio" field (webm/ogg blob)
 * Returns:  { transcript: string }
 *
 * Uses Groq Whisper (whisper-large-v3) for low-latency transcription.
 * To switch to OpenAI Whisper instead, see the commented block below.
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

    console.log(`[Transcribe] Received audio — ${req.file.size} bytes`);

    // Groq Whisper — wrap the buffer in a File so the SDK can stream it
    const audioFile = new File([req.file.buffer], 'recording.webm', {
      type: req.file.mimetype || 'audio/webm',
    });

    const result = await groq.audio.transcriptions.create({
      model: 'whisper-large-v3',
      file: audioFile,
    });

    // ── OpenAI alternative ──────────────────────────────────────
    // const result = await openai.audio.transcriptions.create({
    //   model: 'whisper-1',
    //   file: new File([req.file.buffer], 'recording.webm', { type: 'audio/webm' }),
    // });
    // ────────────────────────────────────────────────────────────

    console.log(`[Transcribe] Transcript: "${result.text}"`);
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