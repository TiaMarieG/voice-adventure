/**
 * POST /api/dm
 *
 * Receives: { transcript: string, history: Message[], act: string, systemPrompt: string }
 * Returns:  { response: string, outcome: string, nextAct: string | null }
 *
 * Uses Groq + Llama 3 (llama3-70b-8192) in JSON mode.
 *
 * The LLM returns a structured object so GameContext.jsx can drive
 * the state machine without a second classification call:
 *
 *   {
 *     "narration": "Cinematic 1-3 sentence prose, TTS-ready.",
 *     "outcome":   "CONTINUE | GAME_OVER | LOOP | VICTORY | REDIRECT",
 *     "nextAct":   "ACT_1 | ACT_2 | ACT_3 | ACT_4 | null"
 *   }
 * 
 * ───────────────────────────────────────────────────────────────
 */

import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

const ACT_CONTEXT = {
  ACT_1: {
    scene: `The player woke on cold dungeon stone. A booming voice demanded they choose between
three dark archways: Path One, Path Two, or Path Three.`,
    rules: `
- Player chooses Path One (first, one)          → outcome="GAME_OVER", nextAct=null
  Narrate: silver magical bars crystallize around them, trapping them forever.
- Player chooses Path Two (second, two, middle)  → outcome="CONTINUE", nextAct="ACT_2"
  Narrate: they stride into a damp passage; furious argument echoes from ahead.
- Player chooses Path Three (third, three)       → outcome="GAME_OVER", nextAct=null
  Narrate: the floor vanishes, they fall into an abyss of darkness.
- Player says anything else                      → outcome="REDIRECT", nextAct="ACT_1"
  Narrate: the impatient voice thunders again, demanding they choose a path.`,
  },

  ACT_2: {
    scene: `The player entered a torchlit chamber where Goblins and Kobolds argue viciously
over a slain beast, blades drawn, neither side aware of the player yet.`,
    rules: `
- Player negotiates, suggests sharing the meat, proposes peace or cooperation
  → outcome="CONTINUE", nextAct="ACT_3"
  Narrate: their voice cuts through the chaos. Weapons lower. The creatures eat side by side,
  then guide the player upward before retreating at the threshold.
- Player tries to sneak, slip past, hide, or bypass the creatures
  → outcome="GAME_OVER", nextAct=null
  Narrate: a loose stone cracks underfoot. Every head turns. For the first time, Goblins
  and Kobolds agree on something — and charge.
- Player sides with the Goblins
  → outcome="GAME_OVER", nextAct=null
  Narrate: after the Kobolds fall, hungry green eyes turn toward the player — never an ally,
  only the next meal.
- Player sides with the Kobolds
  → outcome="GAME_OVER", nextAct=null
  Narrate: the Kobold swarm wins, then their scaled faces rotate toward the player with the
  same hunger they had for the carcass.
- Player does anything else
  → outcome="REDIRECT", nextAct="ACT_2"
  Narrate: the monsters argue on, oblivious — but not for long.`,
  },

  ACT_3: {
    scene: `The player entered a chamber containing three objects: a gleaming suit of armor,
a massive iron door, and a wooden treasure chest. A Mimic is hiding as one of them.`,
    rules: `
- Player interacts with the wooden chest (open, touch, examine the chest/box/treasure)
  → outcome="CONTINUE", nextAct="ACT_4"
  Narrate: magical smoke billows out, the player's body grows weightless and translucent,
  the dungeon walls dissolve — somewhere distant, the sound of dawn.
- Player touches the suit of armor (armor, suit, helmet, gauntlet)
  → outcome="GAME_OVER", nextAct=null
  Narrate: hollow eye sockets ignite with blue arcane light. The Animated Armor strikes
  with terrifying precision. Blackness.
- Player tries the iron door (door, handle, exit through the door)
  → outcome="GAME_OVER", nextAct=null
  Narrate: what they took for a seam was a mouth lined with hundreds of teeth. The iron is
  the Mimic's hide. It had them completely fooled.
- Player does anything else
  → outcome="REDIRECT", nextAct="ACT_3"
  Narrate: armor, door, chest — one of them is a monster wearing a disguise.`,
  },

  ACT_4: {
    scene: `Near the dungeon exit, a Knight and a Wizard block the player's path to freedom.
Each claims the other is lying. Sunrise is visible just behind them.`,
    rules: `
- Player ignores both, walks past them, goes toward the light, refuses to help either,
  or says "neither" / "both"
  → outcome="VICTORY", nextAct=null
  Narrate: the player walks forward without a word, between them, into the light. The dungeon
  releases its grip. They are free.
- Player sides with the Wizard or helps the Wizard
  → outcome="LOOP", nextAct="ACT_1"
  Narrate: the Knight's sword clears its scabbard in one motion — the Wizard falls. The hilt
  finds the player's skull. Cold stone. Familiar stone. The voice thunders again from above.
- Player sides with the Knight or helps the Knight
  → outcome="LOOP", nextAct="ACT_1"
  Narrate: the Wizard's calm shatters. A fireball reduces the Knight to ash, then the curse
  settles over the player like a shroud. Cold stone. Familiar stone.
- Player does anything else
  → outcome="REDIRECT", nextAct="ACT_4"
  Narrate: the Knight and the Wizard stare, waiting. The sunrise is right there.`,
  },
};

const BASE_DM_PROMPT = `[ROLE]
You are an expert, immersive Dungeon Master for a voice-based text adventure.
Your tone is cinematic, dark, and urgent.

[CONSTRAINTS]
1. Never speak for or act for the player. Describe the world and results only.
2. Keep narration to 1-3 sentences so TTS does not lag.
3. Output clean spoken prose — no asterisks, no brackets, no markdown.`;

function buildPrompt(basePrompt, act) {
  const ctx = ACT_CONTEXT[act];
  if (!ctx) throw new Error(`Unknown act: ${act}`);

  return `${basePrompt}

[CURRENT SCENE — ${act}]
${ctx.scene}

[BRANCHING RULES]
Read the player's action and select the matching outcome:
${ctx.rules}

[OUTPUT FORMAT — CRITICAL]
Respond with ONLY a valid JSON object. No text before or after it. No markdown fences.
Exactly these three fields:

{
  "narration": "<1-3 sentences of cinematic TTS-ready prose>",
  "outcome": "<CONTINUE | GAME_OVER | LOOP | VICTORY | REDIRECT>",
  "nextAct": "<ACT_1 | ACT_2 | ACT_3 | ACT_4 | null>"
}

Use the narration style described in the branching rules above.
nextAct must be null when outcome is GAME_OVER or VICTORY.`;
}

// ── Route ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { transcript, history = [], act, systemPrompt } = req.body;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!transcript) return res.status(400).json({ error: 'No transcript provided.' });
    if (!act)        return res.status(400).json({ error: 'No act provided.' });

    console.log(`[DM] Act: ${act} | Player: "${transcript}"`);

    const fullPrompt = buildPrompt(systemPrompt || BASE_DM_PROMPT, act);

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: fullPrompt },
        ...history,
        { role: 'user', content: transcript },
      ],
      max_tokens: 300,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      console.error('[DM] JSON parse failed. Raw response:', raw);
      return res.status(500).json({ error: 'DM returned malformed JSON.', raw });
    }

    const validOutcomes = ['CONTINUE', 'GAME_OVER', 'LOOP', 'VICTORY', 'REDIRECT'];
    if (!parsed.narration || !validOutcomes.includes(parsed.outcome)) {
      console.error('[DM] Response missing required fields:', parsed);
      return res.status(500).json({ error: 'DM response missing required fields.', parsed });
    }

    console.log(`[DM] → outcome=${parsed.outcome} nextAct=${parsed.nextAct}`);

    return res.json({
      response: parsed.narration,
      outcome:  parsed.outcome,
      nextAct:  parsed.nextAct ?? null,
    });

  } catch (err) {
    console.error('[DM Error]', err);
    res.status(500).json({ error: 'DM response failed.' });
  }
});

export default router;