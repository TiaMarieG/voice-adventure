import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import transcribeRouter from './routes/transcribe.js';
import dmRouter from './routes/dm.js';
import ttsRouter from './routes/tts.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/transcribe', transcribeRouter);
app.use('/api/dm', dmRouter);
app.use('/api/tts', ttsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Voice-to-Venture API is running.' });
});

// ─── 404 fallback ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global error handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🎲 Voice-to-Venture API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});