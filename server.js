const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FetchSandbox Showcases</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #09090b; color: #fafafa; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; -webkit-font-smoothing: antialiased; }
    h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; }
    h1 .icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #4f46e5, #6366f1); display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .sub { color: #71717a; font-size: 15px; margin-bottom: 40px; }
    .grid { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
    .card { background: rgba(39,39,42,0.4); border: 1px solid #27272a; border-radius: 12px; padding: 28px; width: 280px; text-decoration: none; color: #fafafa; transition: border-color 0.2s, transform 0.2s; }
    .card:hover { border-color: #6366f1; transform: translateY(-2px); }
    .card h2 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
    .card .endpoints { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #6366f1; margin-bottom: 10px; }
    .card p { font-size: 13px; color: #a1a1aa; line-height: 1.5; }
    .footer { margin-top: 48px; font-size: 13px; color: #52525b; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <h1><span class="icon">⚡</span> FetchSandbox Showcases</h1>
  <p class="sub">Live API sandbox demos — no keys, no setup</p>
  <div class="grid">
    <a class="card" href="/calcom/">
      <h2>Cal.com</h2>
      <div class="endpoints">282 endpoints</div>
      <p>Bookings, Event Types, Schedules, Slots, and Profile — full CRUD with state.</p>
    </a>
    <a class="card" href="/elevenlabs/">
      <h2>ElevenLabs</h2>
      <div class="endpoints">19 endpoints</div>
      <p>Voices, Text-to-Speech, Voice Cloning, User Profile, and Generation History.</p>
    </a>
    <a class="card" href="/voiceforge/">
      <h2>VoiceForge</h2>
      <div class="endpoints">ElevenLabs app</div>
      <p>Full narration studio app built on the ElevenLabs sandbox — with code reveal.</p>
    </a>
  </div>
  <p class="footer">Powered by <a href="https://fetchsandbox.com">fetchsandbox.com</a></p>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Showcases running at http://localhost:${PORT}`);
});
