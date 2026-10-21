# HELIOS Mobile — Venus Initiative

Unity 6/C# mobile track: the first vertical slice focuses on the Venus campaign and Venus session.

## Current assets
- `SolarSystemCatalog.cs` — long-term franchise-wide astronomical catalog.
- `VenusMissionCatalog.cs` — four playable Venus regions with shared IDs.
- `VenusPreviewBootstrap.cs` — asset-free 3D Venus placeholder, camera, light, touchable debug selector.

## To preview
Create a Unity 6 project and empty scene, attach `VenusPreviewBootstrap` to an empty GameObject, press Play. For Android/iOS, follow Unity's platform build instructions.

**Status:** Unity and device builds have not been run. The OnGUI control is a temporary engineering interface, not final touch UX. Economy and narrative parity with Lite are upcoming integration tasks.
