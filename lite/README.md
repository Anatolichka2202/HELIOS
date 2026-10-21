# HELIOS Lite — Venus Initiative (0.4)

The first playable vertical slice is **Venus**. The planned franchise remains Solar System-wide.

## Run locally

```bash
cd lite
npm run check
npm test
python3 -m http.server 8080
```

Open http://localhost:8080. No backend or bundler required.

## Mechanics currently implemented

- Story campaign: fictitious classified USSR archive, Russian research council, evidence-driven international agreement.
- Sandbox session: same systems without story gates.
- Four Venus operating zones, eight prerequisite-driven engineering projects.
- Delayed Earth–Venus shipments (two turns), consumption and repair of aerostat, simplified atmospheric hazard.
- Annual budget/research and clear victory condition: three stable years of an operating cloud laboratory.
- Versioned, validated browser saves; unit tests and JSON data-contract checks (16 tests total).

## Publish for iPhone

[Pages deployment workflow](../.github/workflows/pages.yml) packages only `index.html`, `style.css`, `engine.js`, `game.js`.
Enable this repository's **Settings → Pages → Source: GitHub Actions**, then run the workflow on `main`.
This is not a live public URL until deployment succeeds.

## Limitations

- Economic units and atmospheric events are illustrative, not realistic scientific modeling.
- No device-level iPhone verification, polished UI/UX or accessibility audit yet.
- No real cutscenes, voice acting, multilayer 3D or multiplayer.
- Game state is local to the browser, not cloud-synced.

See [Venus vertical slice](../design/VENUS_VERTICAL_SLICE.md), [campaign](../design/VENUS_CAMPAIGN.md), and [shared scenario contract](../shared/venus-scenario.json).
