/**
 * POST /api/dm
 *
 * Receives: { transcript: string, history: Message[], act: string, systemPrompt: string }
 * Returns:  { response: string, mock?: boolean }
 *
 * ── Integration point ──────────────────────────────────────────
 * Replace the mock block below with the Groq Llama 3 call:
 *
 *   npm install groq-sdk
 *   import Groq from 'groq-sdk';
 *   const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
 *
 *   const completion = await groq.chat.completions.create({
 *     model: process.env.GROQ_MODEL || 'llama3-70b-8192',
 *     messages: [
 *       { role: 'system', content: systemPrompt },
 *       ...history,
 *       { role: 'user', content: transcript },
 *     ],
 *     max_tokens: 300,
 *     temperature: 0.85,
 *   });
 *
 *   const response = completion.choices[0].message.content;
 *   return res.json({ response });
 *
 * Notes:
 *  - history is an array of { role: 'user'|'assistant', content: string }
 *  - systemPrompt contains the DM role, constraints, and current act description
 *  - Keep max_tokens low (200-300) to stay within TTS latency budget
 * ──────────────────────────────────────────────────────────────
 */

import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { transcript, history = [], act, systemPrompt } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided.' });
    }

    console.log(`[DM] Act: ${act} | Player: "${transcript}"`);

    // ── TODO: Replace this mock with Groq / Llama 3 integration ──
    return res.json({
      response: '',
      mock: true,
      message: 'LLM DM not yet integrated. Story logic handled client-side.',
    });

  } catch (err) {
    console.error('[DM Error]', err);
    res.status(500).json({ error: 'DM response failed.' });
  }
});

export default router;