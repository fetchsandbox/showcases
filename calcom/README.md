# Cal.com API Sandbox Demo

Live sandbox for the Cal.com scheduling API — 282 endpoints, fully stateful.

## Run

```bash
cd .. && npm start
```

Open [http://localhost:3000/calcom/](http://localhost:3000/calcom/)

## What You'll See

- **Event Types** — List all event types with duration and settings
- **Bookings** — View existing bookings
- **Create Booking** — POST a new booking and see it appear in state
- **Schedules** — Weekly availability with time slots
- **Profile** — User profile data

Every API call goes to `fetchsandbox.com` — no Cal.com API key needed.

## Endpoints Used

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v2/event-types` | List event types |
| GET | `/v2/bookings` | List bookings |
| POST | `/v2/bookings` | Create a booking |
| GET | `/v2/schedules` | List schedules |
| GET | `/v2/slots` | Available slots |
| GET | `/v2/me` | User profile |
