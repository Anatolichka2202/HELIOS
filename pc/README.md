# HELIOS PC — Unreal Engine 5, Venus playable source prototype

**State:** Unreal C++ files and game targets are committed. **No Unreal Editor compilation or Windows package has been performed in this environment.** This is a debug playable prototype, not finished 3D/art/first person.

## What is implemented in source

- `UVenusMissionSubsystem` — a GameInstance-owned model shared across all levels, current strategic camera and future walkable station. Contains Venus campaign/session state, resource costs, engineering projects, funding choices, delivery, policies, repairs, deterministic storms, success and failure.
- `AVenusPrototypeGameMode` — spawns a stylized Venus scene with default fly camera and attaches an input controller.
- `AVenusPrototypePlayerController` — keyboard controls to carry out real game commands from the model; writes state and errors to on-screen debug text.
- `AVenusPrototypeActor` — sphere placeholder for Venus, orbital relay and aerostat markers, now visible only after their projects have been built; aerostat visual scale reflects current condition.
- `AVenusMissionConsole` — source component for a later walkable station; requests the same subsystem state and repair command.
- `ASolarSystemActor` — future map scaffold, **not** Venus first vertical slice.
- `core/` — separate C++ research library, **not yet linked** into Unreal and not claimed to be a shared production runtime.

## Reproduce in Unreal Editor

1. Install UE5 (the initial `HELIOS.uproject` EngineAssociation is `5.5`). Use Visual Studio toolchains appropriate for that engine.
2. Open `pc/HELIOS.uproject`, generate project files if prompted and compile editor targets.
3. Open or create a blank level. Ensure `VenusPrototypeGameMode` is set as the world's game mode, or use the global default from `Config/DefaultEngine.ini`.
4. Press Play. The model starts in 2034; camera should view the Venus proxy with orbit control provided by `ADefaultPawn`. If a window starts inside the planet, check camera positioning in `VenusPrototypeGameMode.cpp`.
5. Use keyboard commands below. Debug feedback appears in the viewport.
6. Run a full mission chain and record compile errors, FPS and usability in [Issue #7](https://github.com/Anatolichka2202/HELIOS/issues/7).

## Debug controls

| Key | Action |
|---|---|
| `1` | scientific council |
| `2` | open/public funding |
| `3` | recover archive |
| `4` | atmospheric probe |
| `5` | relay |
| `6` | international treaty |
| `7` | first aerostat |
| `8` | logistics programme |
| `9` | cloud laboratory |
| `Q` | dispatch cargo |
| `E` | repair aerostat |
| `R` | cycle conservation / normal / intensive operation |
| `N` | next simulation period |

These bindings are intentionally not a production UI. Unreal version-specific compilation and world startup need a real Editor smoke test.

## Narrative and first person

Game state already exists independently of the view; the future first-person room uses `AVenusMissionConsole::ReadOperationsReport()` and `RequestAerostatRepair()`. A finished walkable room, character controller, interaction trace, cinematic dialogue, asset pipeline and audio **do not yet exist**.

## Engineering constraints

The current per-period physics/energy, risk coefficients, engineering projects and story decisions are illustrative and mirror the current Lite mechanical structure. Shared IDs must be checked against `shared/venus-scenario.json` with `python3 tools/verify_native_contracts.py`. Cross-engine parity tests and visual validation remain open.

## Near-term milestone
Compile in Editor → verify planet and controls → add usable strategy UMG UI → make an actual atmospheric platform scene → limited first-person experiment → package Windows prototype. Keep all changes committed with a build report.
