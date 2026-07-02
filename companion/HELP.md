# ProTimer

Controls [ProTimer](https://github.com/srdjankotarlic/protimer) — a free, open-source stage timer for live production (macOS & Windows).

## Configuration

1. Open ProTimer on the computer that runs the show.
2. In ProTimer's **Network → OBS · Phone** panel, look at the **API (Stream Deck / Companion)** row — it shows `http://<host>:<port>/cmd?type=start&t=<token>`.
3. Enter that **host**, **port** (default `7878`) and **token** here.

> The token changes every time ProTimer restarts — update it here after a restart.

## Actions

- **Start / Pause** — toggles the timer
- **Reset**
- **GO (next cue)** — jumps to and starts the next rundown item
- **Blackout (toggle)**
- **Adjust time** — ± seconds while running or paused
- **Set duration** — minutes
- **Message to speaker** / **Clear speaker message**
- **Text on screen** / **Clear on-screen text**
- **Set mode** — countdown / stopwatch / clock

## Feedbacks

- **Timer is running** — button turns green
- **Blackout is active** — button turns red

## Variables

- `$(protimer:time)` — the time shown on the stage screen
- `$(protimer:running)`, `$(protimer:mode)`, `$(protimer:blackout)`
