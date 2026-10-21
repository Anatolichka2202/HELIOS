# HELIOS PC — Venus Initiative

Unreal Engine 5/C++ flagship. The planned franchise is Solar System-wide; the first vertical slice is Venus.

## Current source
- Unreal project module, game/editor targets and config.
- `VenusPrototypeActor`: asset-free Venus placeholder sphere, atmospheric aerostat marker and orbit relay marker.
- `SolarSystemActor`: legacy franchise-wide map scaffold, **not** the first campaign scene.

## Opening in Unreal
1. Use Unreal Engine 5.5 (the initial `.uproject` association; adjust for installed engine as needed).
2. Open `pc/HELIOS.uproject`, let Unreal generate project files and compile.
3. Create an empty level with camera; place `AVenusPrototypeActor` in it.
4. Tune `PlanetPreviewRadius` and `AtmospherePreviewOffset` in Details.

**Status:** code committed; no UE Editor build, scene screenshot or packaged PC build has been verified. The scene is a placeholder, not a physically realistic Venus renderer.
