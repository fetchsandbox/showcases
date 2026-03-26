# FetchSandbox Showcases

Live API sandbox demos powered by [FetchSandbox](https://fetchsandbox.com). Each folder contains a self-contained demo that runs against a real FetchSandbox sandbox — no API keys, no production accounts, no setup.

## Quick Start

```bash
git clone https://github.com/fetchsandbox/showcases.git
cd showcases
npm install
npm start
```

Open `http://localhost:3000` and pick a demo.

## Demos

| API | Endpoints | Demo |
|-----|-----------|------|
| [Cal.com](calcom/) | 282 | Bookings, Event Types, Schedules, Slots, Profile |
| [ElevenLabs](elevenlabs/) | 19 | Voices, Text-to-Speech, Voice Cloning, History |
| [VoiceForge](voiceforge/) | ElevenLabs app | Full narration studio with code reveal — shows every API call goes to FetchSandbox |
| [HireDesk](hiredesk/) | Cal.com app | Interview scheduling platform with code reveal — event types, schedules, bookings |

Each demo is a single HTML file that makes live API calls to `fetchsandbox.com`. The Cal.com and ElevenLabs demos use a split-screen UI showing the app on the left and network requests on the right. VoiceForge is a full-screen app demo that reveals the source code at the end, highlighting that swapping one URL makes it production-ready.

## How It Works

1. We upload a public OpenAPI spec to FetchSandbox
2. FetchSandbox parses the spec and generates a stateful sandbox
3. The demo HTML calls the sandbox endpoints — create, read, update, delete
4. State persists across calls, just like a real API

No mock data. No hardcoded responses. The sandbox generates realistic data from the spec.

## Add Your Own

Have an OpenAPI spec? Upload it at [fetchsandbox.com](https://fetchsandbox.com) and get a working sandbox in 60 seconds.

## License

MIT
