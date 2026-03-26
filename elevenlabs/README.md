# ElevenLabs API Sandbox Demo

Live sandbox for the ElevenLabs voice AI API — 19 endpoints, fully stateful.

## Run

```bash
cd .. && npm start
```

Open [http://localhost:3000/elevenlabs/](http://localhost:3000/elevenlabs/)

## What You'll See

- **Voices** — Browse available voices with waveform previews
- **Text-to-Speech** — Generate speech from text
- **Voice Cloning** — Add a custom voice
- **Profile** — User profile and subscription data
- **History** — Generation history

Every API call goes to `fetchsandbox.com` — no ElevenLabs API key needed.

## Endpoints Used

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/voices` | List voices |
| POST | `/v1/text-to-speech/{id}` | Generate speech |
| POST | `/v1/voices/add` | Clone a voice |
| GET | `/v1/user` | User profile |
| GET | `/v1/user/subscription` | Subscription info |
| GET | `/v1/history` | Generation history |
