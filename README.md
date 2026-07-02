# companion-module-protimer

[Bitfocus Companion](https://bitfocus.io/companion) module for **[ProTimer](https://github.com/srdjankotarlic/protimer)** — a free, open-source stage timer for live production (macOS & Windows).

Gives you Stream Deck buttons for: Start/Pause, Reset, GO next cue, Blackout, ±time, set duration, speaker messages and on-screen text — plus live feedbacks (running = green, blackout = red) and a `$(protimer:time)` variable you can put on a button face.

See [companion/HELP.md](companion/HELP.md) for setup and the full action list.

## Try it now (no module needed)

ProTimer also works with Companion's built-in **Generic HTTP** module — every command is a GET URL shown in ProTimer's network panel. This dedicated module adds nicer actions, live feedbacks and variables on top.

## Development

```bash
git clone https://github.com/srdjankotarlic/companion-module-protimer.git
cd companion-module-protimer
npm install
```

Then in Companion: **Settings → Developer modules path** → point it at the parent folder of this repo and the module appears in the connections list.

Package for distribution:

```bash
npm run package
```

## Status

Working implementation, pending submission to the official Companion module registry
(via [bitfocus/companion-module-requests](https://github.com/bitfocus/companion-module-requests)).

## License

MIT © Srdjan Kotarlic
