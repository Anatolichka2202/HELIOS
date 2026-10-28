# HELIOS Lite — Venus Initiative (0.8.0)

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

[Pages deployment workflow](../.github/workflows/pages.yml) packages the game runtime, its franchise configuration, styles, PWA files and assets.
The repo publishes using **Settings → Pages → Source: Deploy from a branch → main → /(root)**, using the top-level redirect to `/lite/index.html`. Do **not** use both deployment configurations simultaneously. Deployment was first confirmed via GitHub Pages; after each update check Actions and reload the published URL.

## Limitations

- Economic units and atmospheric events are illustrative, not realistic scientific modeling.
- No device-level iPhone verification, polished UI/UX or accessibility audit yet.
- 0.8 adds original SVG cinematic story beats and optional synthesised interface sounds. No filmed/3D cutscenes, voice acting, original score, or multiplayer yet.
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
- 66 regression/contract/UI and commerce checks passed in an isolated JS execution environment; GitHub Actions success still requires checking its dashboard.
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

## Franchise and monetization architecture (October 2026)

**Lite is intended to be a standalone revenue-generating game**, not merely a free PC demo. The web UI now has a non-interruptive three-product showcase explaining differences between Lite (classified scientific expedition), Mobile (operating cloud stations) and PC (full Solar System civilization strategy). A link to this information is shown after a finished mission. The engineering simulation and free current scenario have **no paywall or advertising interruptions**.

The storefront/source of truth is `ecosystem.js`. It includes two deliberately disabled offers: `support` (voluntary payment) and `paidEpisodes` (additional self-contained Lite stories). No payout account, hosted checkout or purchasable game is currently configured: **the web game cannot accept money yet**. Mobile and PC shop URLs are also absent, so false «buy now» buttons are not displayed.

When a verified publisher-controlled HTTPS checkout/store page actually exists, update only the relevant offer and confirm any provider's commercial terms, local tax/consumer rules and customer support. Do not set `enabled:true` without manually verifying payments and refunds; do not collect card data in this static app. See [franchise strategy v0.4](../design/11_FRANCHISE_PRODUCT_STRATEGY.md).

The artwork is no longer constrained to static 2D: lightweight atmospheric CSS motion is present, and WebGL/2.5D/3D may be used selectively once physically tested for FPS, load time, accessibility and battery on iPhone/Android. Current animations respect `prefers-reduced-motion`.

To verify:
```sh
cd lite
npm run check
npm test
python3 ../tools/verify_web_assets.py
```

The simulation and UI suite (including safe storefront checks) had **66 passing checks in a controlled JS harness** at the time of the v0.4 product-strategy update. This does not certify a real purchase, runtime FPS or native client build.

## New in 0.8 — first interactive cinematic story slice

- Story chapters are staged fullscreen over **original source-controlled SVG key art**: Soviet/Russian archive premise, science council, Venus probe plunge and radio blackout, first working aerostat, acid-front crisis and mission epilogue. These are illustrated game cinematics, **not generated footage or full 3D**.
- Responsive cinematic layout, shot sequencing, subtitles, ability to skip or replay in the **Сцены** menu, optional opt-in synthesis of short sounds, and support for reduced-motion accessibility settings.
- A probe signal incident offers **three real choices**:
  - deep recovery: −8 budget, −4 energy, +18 science now, +2 science in subsequent turns;
  - publish open telemetry: +9 science now and +12 funding on international treaty;
  - salvage the spacecraft: −3 science, +8 supplies now.
- The signal decision also works through the normal cloud-project UI if the cinematic is skipped. Cutscene playback does **not** change resources by itself.
- Browser save `version:4` remains backward compatible; `probeDiscovery` and `cinematicSeen` are optional when restoring old saves.
- Two new runtime modules: `scenes.js` (script and conditions) and `cinema.js` (presentation and keyboard controls). Added 3 original art files in `assets/cinema-*.svg`.
- `shared/venus-scenario.json` now documents the optional `liteExperimentalV08` extension, explicitly **not yet native-client parity**.
- See [0.8 playtest guide](../docs/PLAYTEST_VENUS_0_8.md). CI verified **78/78 Lite JS tests** and referenced SVG assets; true iPhone/Android usability still requires manual device testing.
