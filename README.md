# Voice to Venture!

*When you're done speaking to the DM through the microphone, click the red circle to indicate that you're finished!*


## Table of Contents
1. [Quick Start](#quick-start)
1. [Team Members](#team-members)
2. [Project Description](#project-description)
3. [Key Features](#key-features)
4. [Set Up Steps](#set-up-steps)
6. [AI Services & API Keys](#ai-services--api-keys)

---

## Quick Start

Have **2 terminals** open.

- **Terminal 1 Backend:**  `cd backend` → `npm run dev` → runs on http://localhost:3001
- **Terminal 2 Frontend:** `cd frontend` → `npm run dev` → runs on http://localhost:5173 - Open this one for the game!

---

## Team Members
* **Xalli Bell** (https://www.linkedin.com/in/xalli-bell-joyce/)
* **Tia Marie Gordon** (https://www.linkedin.com/in/tiamariegordon/)
* **Emily Menken** (https://www.linkedin.com/in/emily-menken/)
* **Tav Singh** (https://www.linkedin.com/in/tavparsadsingh/)

---

## Project Description
**Voice to Venture** is a speech to text adventure game. Players speak their choices aloud while the game transcribes, passing it to an AI Dungeon Master which then narrates the result back through text and synthesized speech. The story unfolds across four acts with choices that matter!

## Key Features
* **Voice input:** State your action aloud, no typing required!
* **AI Dungeon Master:** Groq/Llama 3 evaluates the player's choices and generates a cinematic narration of the outcome.
* **Speech-to-text:** Groq Whisper transcribes your words in real time.
* **Text-to-speech:** The DM's narration is read aloud through ElevenLabs voice synthesis.
* **Branching story:** 4 acts, with multiple outcomes per act!

---

## Set Up Steps

### Backend
Open a new terminal and then run:
```bash
cd backend
npm install
```
### Frontend
Open a separate terminal from the backend and then run:
```bash
cd frontend
npm install
```

*Keep both terminals running while playing Voice to Venture!*

### !! Environment File !!
Make a copy of the file `.env.example` found in the backend folder, and rename it to `.env`. In the empty spaces, fill in your API keys using the instructions found in AI Services & API Keys below (or the instructions in the .env.example file):


## AI Services & API Keys

Three AI services power the game. All keys go in your newly created `backend/.env`.

### Groq: covers both STT and the DM
Groq runs Whisper (speech-to-text) and Llama 3 (the Dungeon Master).

1. Go to https://console.groq.com
2. Sign up/log in
3. Click **API Keys** in the top right of the screen
3. Then click **Create API Key** in the top right
4. Copy the ID! It won't be shown again

```dotenv
GROQ_API_KEY=your key here!!
GROQ_MODEL=llama3-70b-8192
```

*Free tier is perfectly fine for a game like this!*

---

### ElevenLabs: text-to-speech narration

1. Go to https://elevenlabs.io
2. Sign up/log in
3. Click on **ElevenAPI** from the Eleven products dropdown in the top left
4. Look for the Configure section and click **API Keys**
5. Then click **Create Key** in the upper right
6. Click the **Restrict Key** switch into the off position 

*Don't worry about it getting leaked, if you're the free tier you won't get charged for anything- it'll stop when it reaches your limit of tokens.*

7. Give it name if you'd like and then click **Create Key**
8. Copy the ID! It won't be shown again


```dotenv
ELEVENLABS_API_KEY=your key here!!
```

*Free tier is, again, perfectly fine for a game like this!*


#### Choosing a Voice (ELEVENLABS_VOICE_ID)

*Option A: Select a VOICE_ID from the .env comments*

* The `.env` has a default voice provided. More voices through their library can be accessed by their paid subscription. Once you have your paid account, simply copy the ID number into the VOICE_ID line and you're set!

*Option B: pick your own voice*
1. Go to https://elevenlabs.io/app/voice-library
2. Find a voice that you like
3. Click a voice to **Add to My Voices**
4. Go to **My Voices**, click the 3 dots on the right of the voice's entry and select **Copy Voice ID**
1. Paste the just copied ID into the line of the `.env` and you're set!