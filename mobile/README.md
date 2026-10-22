# HELIOS Mobile — Venus playable Unity prototype

**Status:** Unity 6/C# source code committed; an Android APK and iOS IPA have **not** been built or tested.

The mobile track now contains:
- `VenusSessionModel.cs`: offline deterministic simulation of campaign and free Venus session; engineering projects, funding, supply shipments, aerostat operation policies, hazards, repair, victory and failure.
- `VenusPlayableBootstrap.cs`: a temporary but **playable** debug UI and 3D Venus sphere that reads/writes the model and saves state via Unity PlayerPrefs.
- `Assets/Editor/HeliosSceneCreator.cs`: Unity Editor menu that builds an empty playable scene, camera and supporting objects at runtime.
- `VenusMissionCatalog.cs`: four operational zones.
- `VenusPreviewBootstrap.cs` and `SolarSystem*.cs`: earlier visual scaffolds, not the playable entry point.

## First Editor run

1. Open `mobile/` as a Unity 6 project (the `ProjectVersion.txt` is a starting editor association, not a requirement to use precisely that patch).
2. Let packages resolve and scripts compile.
3. Choose **HELIOS → Create Venus Playable Scene** in the top menu.
4. Press Play. Interact with the story, build a probe, relay, aerostat, logistics and lab, switch operating policies, manage deliveries and survive three stable years.
5. Check the Console. If there are compiler or rendering errors, record them in [Mobile issue](https://github.com/Anatolichka2202/HELIOS/issues/8).

## Mobile build

Unity Editor → Build Profiles → Android (or iOS if Mac/Xcode are available) → add `Assets/Scenes/VenusPrototype.unity` → Build & Run on a device. This procedure still requires real verification.

The UI uses Unity immediate-mode `OnGUI` deliberately for initial integration. It is a **temporary engineering interface**, not finished touch UX. Gameplay is simulated locally and must remain playable offline.

## Model relationship

The C# rules currently parallel the simplified Lite v0.6, but are **not production parity certified**. The canonical scenario specification is `shared/venus-scenario.json`; planned contract/golden tests will eliminate drift. Neither a shared C++ DLL nor a server is required for this prototype.
