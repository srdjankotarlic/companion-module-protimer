# companion-module-protimer

[Bitfocus Companion](https://bitfocus.io/companion) module for **[ProTimer](https://github.com/srdjankotarlic/protimer)** — a free, open-source stage timer for live production (macOS & Windows).

Gives you ready-made Stream Deck presets for Start/Pause, Reset, GO next cue, Blackout, time adjustment, speaker messages and on-screen text. Live feedbacks cover connection, warning colors, overtime, running, blackout and messages; variables include the timer plus current and next rundown cues.

See [companion/HELP.md](companion/HELP.md) for setup and the full action list.

## Try it now (no module needed)

ProTimer also works with Companion's built-in **Generic HTTP** module — every command is a GET URL shown in ProTimer's network panel. This dedicated module adds nicer actions, live feedbacks and variables on top.

## Development

```bash
git clone https://github.com/srdjankotarlic/companion-module-protimer.git
cd companion-module-protimer
npm install
npm test
npm run check
```

Then in Companion: **Settings → Developer modules path** → point it at the parent folder of this repo and the module appears in the connections list.

Package for distribution:

```bash
npm run package
```

## Status

Version 1.1 uses Companion's current Node 22 runtime and module-base 2.x API. Official Companion registry submission is pending; local developer-module installation works today.

## License

MIT © Srdjan Kotarlic
