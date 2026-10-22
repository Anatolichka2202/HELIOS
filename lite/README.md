# HELIOS Lite — Venus Initiative (0.7)

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
- Versioned, validated browser saves; unit tests and JSON data-contract checks (regression-tested).

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

## New in 0.5

- Funding choice: publicly funded open science or private backers, with different upfront budgets and international-grant outcomes.
- Expedition failure if the aerostat remains nonoperational for two consecutive turns.
- Autosave after successful decisions and turns.
- Step-by-step actionable mission objective for new players.
- Original Venus/aerostat SVG art tracked in this repository.
- UI smoke tests, scenario-contract checks, and GitHub Actions build gates.

## New in 0.6

- Player-chosen operating policies: **conserve / standard / intensive** change science, power usage, supply costs and aerostat wear.
- Live SVG mission diagram: probe, relay, aerostat and cloud laboratory unlock as construction progresses; damage affects appearance.
- Supply timeline, station condition, next-period resource forecast and end-of-session score.
- Sandbox difficulty presets: **standard / resource-constrained / well-funded**.
- Automatic local save; backup **export/import JSON** for transferring a game between browsers.
- PWA install metadata and service-worker shell caching (HTTPS; device verification pending).
- 61 regression/contract/UI checks passed in an isolated JS execution environment; GitHub Actions success still requires checking its dashboard.
- Runtime assets and project-ID contract checks are part of CI.

**To play locally:** `cd lite && npm run check && npm test && python3 -m http.server 8080`. To play from iPhone, deploy using `.github/workflows/pages.yml` after enabling GitHub Pages.

## New in 0.7 — engineering consequences

- An irreversible **reinforced vs lightweight aerostat** decision changes project cost, lab science, wear and storm severity.
- New aerostats and labs undergo **one game-period commissioning**; their resources are reserved at construction start.
- The first operating cloud lab encounters a **blocking acidic front**: risky sample, costly protection, or delayed retreat.
- Dangerous sampling can unlock a new corrosion-resistant coating, with measurable engineering effects.
- No supplies or power means **no stable-year progress and no productive laboratory output**.
- Private investment entails recurring licence payments; open science grants research bonuses.
- **Distinct story epilogues**, visual crisis warnings, and backward compatibility for existing version-four saves.
- See [0.7 playtest guide](../docs/PLAYTEST_VENUS_0_7.md); native Unreal/Unity prototype rules have not yet adopted these changes.

**Caution:** the game's mechanical periods are abstract and the science/engineering coefficients are uncalibrated. We have not measured real user retention or verified the browser build on physical iPhone Safari.
