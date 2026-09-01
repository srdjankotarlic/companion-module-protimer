# companion-module-srdjankotarlic-protimer

[Bitfocus Companion](https://bitfocus.io/companion) module for **[ProTimer](https://github.com/srdjankotarlic/protimer)** — a free, open-source stage timer for live production (macOS & Windows).

Gives you ready-made Stream Deck presets for Start/Pause, Reset, GO next cue, Blackout, time adjustment, speaker messages and on-screen text. Live feedbacks cover connection, warning colors, overtime, running, blackout and messages; variables include the timer plus current and next rundown cues.

See [companion/HELP.md](companion/HELP.md) for setup and the full action list.

## Compatibility

This module targets Companion's Node 22 and module API 2.0 runtime and requires **Companion 4.3 or newer**.

## Install

Once the first release is accepted into the official Companion registry, install ProTimer from Companion's **Modules** page and add a ProTimer connection. Enter the host, port, and token shown in ProTimer's **Network - OBS / Phone** panel.

For pre-release testing, run `yarn package` and import the generated `srdjankotarlic-protimer-2.0.0.tgz` through **Modules → Import module package**.

## Try it now (no module needed)

ProTimer also works with Companion's built-in **Generic HTTP** module — every command is a GET URL shown in ProTimer's network panel. This dedicated module adds nicer actions, live feedbacks and variables on top.

## Development

```bash
git clone https://github.com/bitfocus/companion-module-srdjankotarlic-protimer.git
cd companion-module-srdjankotarlic-protimer
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

Version 2.0 is prepared for first-release review in the official Companion registry. Until that review is accepted, use a locally built package for testing.

## License

MIT © Srdjan Kotarlic
