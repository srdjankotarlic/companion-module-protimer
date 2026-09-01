# ProTimer

Control [ProTimer](https://github.com/srdjankotarlic/protimer), a free and open-source stage timer for Windows and Apple Silicon macOS.

Requires Bitfocus Companion 4.3 or newer.

## Configuration

1. Open ProTimer on the computer running the show.
2. Open **Network - OBS / Phone**.
3. In the **API (Stream Deck / Companion)** row, note the host, port, and the value after `t=`.
4. Enter those three values in the Companion connection.

The session token changes whenever ProTimer restarts. If commands stop with an authentication error after a restart, copy the new token into Companion.

## Presets

Starter presets are grouped by purpose:

- **Status:** live timer display and current/next cue
- **Transport:** Start/Pause and Reset
- **Rundown:** GO to next cue
- **Timer adjustment:** +/- 1 minute and +/- 10 seconds
- **Output:** Blackout, BREAK text, and clear text
- **Speaker messages:** WRAP UP, LAST QUESTION, and clear message

## Actions

- Start / Pause
- Reset
- GO to next rundown cue
- Toggle blackout
- Adjust time by positive or negative seconds
- Set duration in minutes
- Set countdown, stopwatch, or clock mode
- Show / clear a speaker message
- Show / clear on-screen text

## Variables

- `$(this:time)` - formatted live timer
- `$(this:remaining_seconds)` - remaining or elapsed seconds
- `$(this:running)`, `$(this:mode)`, `$(this:phase)`
- `$(this:connected)`, `$(this:blackout)`
- `$(this:current_cue)`, `$(this:total_cues)`
- `$(this:current_cue_name)`, `$(this:next_cue_name)`
- `$(this:message)`, `$(this:on_screen_text)`

`this` refers to the ProTimer connection that owns the preset, so the variables continue to work if you rename the connection in Companion.

## Feedbacks

- Connected
- Timer running
- Yellow warning
- Red warning
- Overtime
- Blackout active
- Speaker message visible

## Troubleshooting

- **Bad configuration:** enter both a host/IP and the current token.
- **Authentication failure:** ProTimer restarted; copy the new token from its API row.
- **Connection failure:** confirm ProTimer is open, the port is correct, and both computers can reach each other on the network.
- **No state yet:** start or reset the timer once and confirm the ProTimer Control window is open.

The module uses ProTimer's HTTP command endpoint and live SSE state feed. Generic HTTP remains available as a zero-install fallback.
