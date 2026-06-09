/**
 * storyLogic.js
 *
 * Single source of truth for the story.
 *
 * Contains:
 *  - ACTS  — act identifiers
 *  - OUTCOMES — possible result types
 *  - DM_SYSTEM_PROMPT — the LLM system prompt (used when AI is integrated)
 *  - narrations — all cinematic DM text for every story branch
 *  - evaluateAction() — keyword-based mock evaluator (swap for LLM call later)
 */

// ── Identifiers ──────────────────────────────────────────────────
export const ACTS = {
   ACT_1: 'ACT_1',
   ACT_2: 'ACT_2',
   ACT_3: 'ACT_3',
   ACT_4: 'ACT_4',
};

export const OUTCOMES = {
   CONTINUE: 'CONTINUE',  // Advance to nextAct
   GAME_OVER: 'GAME_OVER', // Dead end — show restart
   LOOP: 'LOOP',      // Cursed restart back to Act 1
   VICTORY: 'VICTORY',   // Player escapes — end screen
   REDIRECT: 'REDIRECT',  // Player's input was off-target, re-prompt same act
};

// ── DM System Prompt ──────────────────────────────────────────────
// This is sent as the system message when the Groq / LLM DM is integrated.
export const DM_SYSTEM_PROMPT = `[ROLE]
You are an expert, immersive Dungeon Master (DM) for a voice-based text adventure. Your tone is cinematic, dark, and urgent.

[CONSTRAINTS]
1. Never speak for or act for the player character (PC). Only describe the world, NPCs, and results of actions.
2. Keep responses brief (1-3 sentences) so the Text-to-Speech engine does not lag.
3. Always end your response by prompting the user for their action.
4. Do not include formatting like asterisks (*actions*) or brackets; output clean, spoken prose only.`;

// ── Narrations ────────────────────────────────────────────────────
// Each string is clean prose with no asterisks or brackets,
// ready to be passed directly to TTS.
export const narrations = {

   [ACTS.ACT_1]: {
      intro:
         `You awaken on cold stone, your cheek pressed against ancient rock slick with age and moisture. The air tastes of decay and forgotten things. A voice thunders from the darkness above — so deep it rattles your bones: "Choose your path, mortal, or suffer a great death." Three dark archways loom before you: Path One, Path Two, and Path Three. What do you do?`,

      path1GameOver:
         `You step through the first archway. A shimmer of silver erupts around you like a closing fist, and bars of pure magical force crystallize from the air. They tighten, inch by inch. In the distance, unseen laughter echoes through the dungeon. The cage is complete. Your adventure ends here.`,

      path2Continue:
         `You stride forward into the second archway. The air thickens; the stone here sweats with moisture. From somewhere ahead comes the unmistakable sound of furious argument — frantic, close, escalating. What do you do?`,

      path3GameOver:
         `Your boot finds the edge of the third archway's floor — and nothing else. Stone gives way to open void. For one breathless moment you hang suspended. Then gravity remembers you. The dungeon rushes upward as you fall into darkness. Silence swallows everything. Your story ends here.`,

      redirect:
         `The voice returns, thunderous with impatience: "Choose, mortal — Path One, Path Two, or Path Three. There is no other option." What do you do?`,
   },

   [ACTS.ACT_2]: {
      intro:
         `A torchlit chamber opens before you. A massive beast lies dead at its center, slain by two arrows that jut from its flanks like rival flags. Around the carcass, Goblins and Kobolds are locked in furious argument — blades drawn, voices shrill, neither side willing to yield an inch. They are completely consumed by the dispute, unaware of your presence. What do you do?`,

      goblinGameOver:
         `You step forward and declare your support for the Goblins. A ragged cheer rises from the green-skinned mob as they overwhelm the Kobolds. Silence falls. Then, slowly, a dozen hungry eyes turn to face you. Weapons unsheathed. Grins widening. You were never an ally — only the next meal.`,

      koboldGameOver:
         `You side with the Kobolds. Their skittering swarm overwhelms the Goblins in a flash of claws and teeth. When the skirmish ends, every scaled face rotates toward you, wearing the same expression they had for the carcass moments ago. You made a terrible mistake.`,

      sneakGameOver:
         `You press yourself to the wall and begin edging toward the far passage. Your foot finds a loose stone. The crack echoes like a thunderclap. Every argument stops. Every head turns. The Goblins and Kobolds look at each other — and, for the first time, they agree on something. They charge.`,

      negotiateSuccess:
         `Your voice cuts through the chaos like a blade. Share the meat. Work together. Why spill blood when there is enough for all? A strange silence falls over the chamber. Weapons slowly lower. The Goblins and Kobolds look at each other — and, against all reason, they nod. They eat side by side. When you move to leave, a pair of each follows, guiding you upward through the dungeon's winding corridors. At the upper threshold, they stop — gesturing urgently ahead with wide, fearful eyes — before retreating into the dark. What do you do?`,

      redirect:
         `The monsters argue on, oblivious to you for the moment. You must act quickly before that changes. What do you do?`,
   },

   [ACTS.ACT_3]: {
      intro:
         `The upper corridors are quiet in a way that feels deliberate. You round a corner and see it: a Mimic, grotesque and enormous, finishing the last of an unfortunate adventurer. It senses your presence. Its bulk scuttles impossibly fast down the hall and disappears into the chamber ahead — the only chamber standing between you and freedom. You step inside. Before you stand three things: a pristine suit of armor gleaming in the torchlight, a massive iron door, and a wooden treasure chest. What do you do?`,

      armorGameOver:
         `You approach the suit of armor. The moment your hand makes contact, hollow eye sockets ignite with cold blue arcane light. The Animated Armor surges upright, draws back a gauntleted fist, and swings with terrifying precision. Blackness. Then nothing.`,

      doorGameOver:
         `You seize the iron door's handle and pull. The door shudders. Then it grins. What you took for a seam is a mouth, lined with hundreds of teeth. What you took for iron is the Mimic's hide. It had you completely fooled. It always does.`,

      chestSuccess:
         `You lift the lid of the wooden chest. A plume of thick, swirling magical smoke billows upward and engulfs you completely. Your body grows weightless — translucent — dissolving at the edges. The dungeon walls blur and vanish like smoke in wind. Somewhere distant, something that sounds like dawn. What do you do?`,

      redirect:
         `The chamber is still, deceptively peaceful. Armor. Door. Chest. One of them is a monster wearing a disguise. You study them carefully. What do you do?`,
   },

   [ACTS.ACT_4]: {
      intro:
         `You materialize in a rush of cold air near the dungeon's entrance. Sunrise paints the sky just beyond. You sprint for daylight — and slam to a halt. Two figures block your path: a Knight in battered armor, and a Wizard whose robes crackle with barely-contained energy. They speak over each other, both pleading urgently for your help. The Knight claims the Wizard imprisoned him without cause. The Wizard claims the Knight betrayed him and must face punishment. One speaks truth. One speaks lies. What do you do?`,

      wizardGameOver:
         `You step toward the Wizard. The Knight's face hardens into something cold and ancient. His sword clears its scabbard in a single fluid motion — and the Wizard falls before either of you can react. The Knight turns to you. The hilt finds the back of your skull. Cold stone. Familiar stone. You open your eyes in a dungeon, your cheek pressed against ancient, moss-eaten rock. The voice thunders from above: "Choose your path, mortal, or suffer a great death."`,

      knightGameOver:
         `You move to defend the Knight. The Wizard's calm shatters instantly. A fireball blooms from his outstretched palm and reduces the Knight to a column of ash. His burning gaze turns to you next, and you feel the curse settle over you like a shroud. Cold stone. Familiar stone. You open your eyes in a dungeon, your cheek pressed against ancient, moss-eaten rock. The voice thunders: "Choose your path, mortal, or suffer a great death."`,

      victorySuccess:
         `You say nothing. You walk forward, between them, toward the light. You do not look back. Behind you, confused silence stretches between Knight and Wizard. The dungeon grows smaller. The air warms. The nightmare loosens its grip — and finally, slowly, releases you entirely. You are free.`,

      redirect:
         `The Knight and the Wizard stare at you, waiting. The sunrise is right there over their shoulders. Every second costs you. What do you do?`,
   },
};

// ── Mock Evaluator ────────────────────────────────────────────────
// Keyword-based branching until the LLM (Groq/Llama) is integrated.
// Returns: { outcome, narration, nextAct }
//
// To integrate the real LLM DM:
//  1. Call POST /api/dm with { transcript, history, act, systemPrompt }
//  2. Use the returned `response` string as the narration
//  3. Parse the act advancement from response or use a second structured call
//
export function evaluateAction(act, transcript) {
   const t = transcript.toLowerCase().trim();

   switch (act) {

      // ── ACT 1: Choose a path ───────────────────────────────────
      case ACTS.ACT_1: {
         const isPath1 = /\b(path\s*(1|one)|first\s*path|one)\b/.test(t);
         const isPath2 = /\b(path\s*(2|two)|second\s*path|two|middle)\b/.test(t);
         const isPath3 = /\b(path\s*(3|three)|third\s*path|three)\b/.test(t);

         if (isPath1) return { outcome: OUTCOMES.GAME_OVER, narration: narrations[ACTS.ACT_1].path1GameOver, nextAct: null };
         if (isPath2) return { outcome: OUTCOMES.CONTINUE, narration: narrations[ACTS.ACT_1].path2Continue, nextAct: ACTS.ACT_2 };
         if (isPath3) return { outcome: OUTCOMES.GAME_OVER, narration: narrations[ACTS.ACT_1].path3GameOver, nextAct: null };
         return { outcome: OUTCOMES.REDIRECT, narration: narrations[ACTS.ACT_1].redirect, nextAct: ACTS.ACT_1 };
      }

      // ── ACT 2: Handle the Goblins vs Kobolds dispute ──────────
      case ACTS.ACT_2: {
         const sidesGoblin = /\bgoblin(s)?\b/.test(t);
         const sidesKobold = /\bkobold(s)?\b/.test(t);
         const triesSneak = /\b(sneak|slip|stealth|creep|hide|invisible|past|bypass|avoid|ignore them)\b/.test(t);
         const negotiates = /\b(share|split|together|cooperate|cooperat|both|peace|negoti|compromise|convince|reason|agree|alliance|deal|stop|fair)\b/.test(t);

         if (negotiates) return { outcome: OUTCOMES.CONTINUE, narration: narrations[ACTS.ACT_2].negotiateSuccess, nextAct: ACTS.ACT_3 };
         if (triesSneak) return { outcome: OUTCOMES.GAME_OVER, narration: narrations[ACTS.ACT_2].sneakGameOver, nextAct: null };
         if (sidesGoblin) return { outcome: OUTCOMES.GAME_OVER, narration: narrations[ACTS.ACT_2].goblinGameOver, nextAct: null };
         if (sidesKobold) return { outcome: OUTCOMES.GAME_OVER, narration: narrations[ACTS.ACT_2].koboldGameOver, nextAct: null };
         return { outcome: OUTCOMES.REDIRECT, narration: narrations[ACTS.ACT_2].redirect, nextAct: ACTS.ACT_2 };
      }

      // ── ACT 3: Navigate the Mimic room ────────────────────────
      case ACTS.ACT_3: {
         const touchesArmor = /\b(armor|armour|suit|helmet|gauntlet|steel|knight)\b/.test(t);
         const touchesDoor = /\b(door|iron|handle|exit|leave|open the door|go through)\b/.test(t);
         const touchesChest = /\b(chest|box|treasure|open|lid|wooden)\b/.test(t);

         if (touchesChest) return { outcome: OUTCOMES.CONTINUE, narration: narrations[ACTS.ACT_3].chestSuccess, nextAct: ACTS.ACT_4 };
         if (touchesArmor) return { outcome: OUTCOMES.GAME_OVER, narration: narrations[ACTS.ACT_3].armorGameOver, nextAct: null };
         if (touchesDoor) return { outcome: OUTCOMES.GAME_OVER, narration: narrations[ACTS.ACT_3].doorGameOver, nextAct: null };
         return { outcome: OUTCOMES.REDIRECT, narration: narrations[ACTS.ACT_3].redirect, nextAct: ACTS.ACT_3 };
      }

      // ── ACT 4: Knight vs Wizard standoff ──────────────────────
      case ACTS.ACT_4: {
         const helpsWizard = /\b(wizard|mage|magic|sorcerer|help the wizard|side with the wizard|with the wizard)\b/.test(t);
         const helpsKnight = /\b(knight|warrior|fighter|soldier|help the knight|side with the knight|with the knight|armor)\b/.test(t);
         const walksAway = /\b(walk|leave|go|ignore|away|neither|both|continue|escape|free|past them|past both|don.t help|don't|refuse)\b/.test(t);

         if (walksAway) return { outcome: OUTCOMES.VICTORY, narration: narrations[ACTS.ACT_4].victorySuccess, nextAct: null };
         if (helpsWizard) return { outcome: OUTCOMES.LOOP, narration: narrations[ACTS.ACT_4].wizardGameOver, nextAct: ACTS.ACT_1 };
         if (helpsKnight) return { outcome: OUTCOMES.LOOP, narration: narrations[ACTS.ACT_4].knightGameOver, nextAct: ACTS.ACT_1 };
         return { outcome: OUTCOMES.REDIRECT, narration: narrations[ACTS.ACT_4].redirect, nextAct: ACTS.ACT_4 };
      }

      default:
         return { outcome: OUTCOMES.REDIRECT, narration: 'The dungeon watches, and waits.', nextAct: act };
   }
}