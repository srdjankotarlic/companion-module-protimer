# Changelog

## 2.0.0

- Prepared the module for its first official Bitfocus registry release as `srdjankotarlic-protimer`.
- Added the previous `protimer` module ID as a legacy ID for existing manual installations.
- Declared compatibility with Companion 4.3 and newer by targeting module API 2.0 on Node 22.
- Added the repository MIT license and CI coverage for formatting and unit tests.

## 1.1.0

- Updated the module runtime to Node 22 and `@companion-module/base` 2.x.
- Added ready-to-use Companion presets for transport, rundown GO, time adjustment, blackout, messages, and live timer/cue displays.
- Added current/next cue, timer phase, connection, message, and screen-text variables.
- Added yellow, red, overtime, message, connection, running, and blackout feedbacks.
- Added request timeouts, controlled SSE reconnects, CRLF-compatible SSE parsing, and clearer bad-token status.
- Added automated unit and local HTTP/SSE integration tests.
