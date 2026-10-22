# HELIOS Venus — implementation delivery 0.6
**Release type:** source milestone · **date:** 23 October 2026
**Important:** code committed; the browser is not yet confirmed as publicly hosted, and native builds are not yet verified.

## Lite (browser) — playable source

- Story campaign: fictional Soviet Venus archive, scientific council in Russia, public/private funding, international treaty.
- Sandbox: standard, resource-constrained and well-funded starting scenarios.
- Four Venus operating regions, eight dependency-gated engineering projects.
- Earth–Venus supply shipments, aerostat wear, repairs, atmospheric storms and three operation modes (conserve / standard / intensive).
- Next-turn forecasts and visible construction progress (probe → relay → aerostat → cloud laboratory).
- Victory after three stable laboratory periods; failure after two periods with destroyed aerostat.
- Autosave, explicit save, JSON backup import/export, app manifest and offline shell caching via service worker.
- Automated JS engine/contract/UI tests and static asset checks; cross-platform static project-ID check.

**Current limitation:** all budget/resources and one-year periods are **game abstractions**, not physical Venus transfer calculations.

## Unity Mobile — offline playable source prototype

- Unity 6 project manifest and Editor menu HELIOS → Create Venus Playable Scene.
- Pure C# mission model, same core project IDs, funding decisions, shipment costs, aerostat modes and victory/failure.
- Runtime primitive 3D Venus, engineering dashboard debug UI, PlayerPrefs JSON persistence.
- No confirmed Unity Editor compilation, Android APK, iOS IPA or modern production touch UI yet.

## Unreal PC — offline playable source prototype

- UE C++ GameInstance Venus mission subsystem and state, used by strategic view and future first-person scenes.
- Default game mode spawns Venus placeholder, fly camera and keyboard debug controller.
- Source keyboard actions for council, funding, project construction, cargo, repair, modes and advancing time.
- Relay/aerostat visibility reflects mission state; console actor reads and repairs the same state.
- No verified UE Editor compile, UMG UI, full first-person scene, package, cinematics or production renderer.

## What is **not** implemented

- Shared compiled C++ runtime across all three clients.
- Physically calibrated orbit transfers/real manufacturing mass-balance.
- Production mobile payment unlock or PC Steam build.
- Multiplayer, server-side simulation or cloud saves.
- Complete 3D city, full campaign, voice acting, cinematics.
- Public HTTPS game URL verified on iPhone.

## How to run

Browser:
```sh
cd lite
npm run check
npm test
python3 -m http.server 8080
```
Native: see `mobile/README.md` and `pc/README.md`.
Static contracts: `python3 tools/verify_native_contracts.py`.
Asset verification: `python3 tools/verify_web_assets.py`.

## Immediate release blockers

1. In GitHub Settings → Pages, set Source to **GitHub Actions** if not already; verify successful deploy, open the real HTTPS URL on iPhone.
2. Open Unity 6 project and compile; fix Editor errors, create scene, test controls on Android.
3. Open Unreal 5.x project and compile; run debug keyboard mission on Windows; record errors.
4. Run all GitHub Actions and fix any failure before declaring green.
5. Verify balance, formatting and actual gameplay duration with players; continue from there rather than starting new framework rewrites.

Source commit history is authoritative. This document describes intended code behavior and remains subject to real runtime tests.
