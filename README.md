# companion-module-protimer

[Bitfocus Companion](https://bitfocus.io/companion) module for **[ProTimer](https://github.com/srdjankotarlic/protimer)** — a free, open-source stage timer for live production (macOS & Windows).

Gives you ready-made Stream Deck presets for Start/Pause, Reset, GO next cue, Blackout, time adjustment, speaker messages and on-screen text. Live feedbacks cover connection, warning colors, overtime, running, blackout and messages; variables include the timer plus current and next rundown cues.

See [companion/HELP.md](companion/HELP.md) for setup and the full action list.

## Install in Companion 4

1. Download [`protimer-1.1.0.tgz`](https://github.com/srdjankotarlic/companion-module-protimer/releases/download/v1.1.0/protimer-1.1.0.tgz).
2. Open Companion and go to **Modules → Import module package**.
3. Select the downloaded `.tgz`, add a ProTimer connection, and enter the host, port, and token shown in ProTimer's **Network - OBS / Phone** panel.

The package is the normal user install while official Companion registry submission is pending. You do not need Node.js, Git, or a developer-modules folder.

## Try it now (no module needed)

ProTimer also works with Companion's built-in **Generic HTTP** module — every command is a GET URL shown in ProTimer's network panel. This dedicated module adds nicer actions, live feedbacks and variables on top.

## Development

```bash
git clone https://github.com/srdjankotarlic/companion-module-protimer.git
cd companion-module-protimer
corepack enable
yarn install --immutable
yarn test
yarn check
```

For local development, set Companion's **Developer modules path** to the parent folder of this repository.

Package for distribution:

```bash
yarn package
```

## Status

Version 1.1 uses Companion's current Node 22 runtime and module-base 2.x API. Official Companion registry submission is pending; the packaged `.tgz` works in Companion 4 today.

## License

MIT © Srdjan Kotarlic
