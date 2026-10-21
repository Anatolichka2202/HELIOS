# HELIOS — Solar Civilization

Multi-platform strategy project about human expansion across the **entire Solar System**. The **first vertical slice focuses on Venus**, with both a story campaign and sandbox sessions.

> Early development: source code and prototypes are here, but no production game or verified mobile/UE build is claimed.

## Workstreams

| Directory | Purpose | Current status |
|---|---|---|
| [lite/](lite/) | Browser Venus Initiative | Interactive source, testable engine, on-device save; deployment pending |
| [pc/](pc/) | Unreal Engine 5 / C++ flagship | UE scaffold and Venus scene actor; build unverified |
| [mobile/](mobile/) | Unity / C# for Android/iOS | Venus scene preview and mission catalog; device builds unverified |
| [core/](core/) | C++ simulation research prototype | CMake and smoke test |
| [shared/](shared/) | Cross-platform data contracts | Venus schema v1 |
| [design/](design/) | Narrative, architecture, roadmap and business assumptions | Venus campaign and long-term franchise |

## Run Lite locally

```sh
cd lite
npm run check
npm test
python3 -m http.server 8080
```

Open http://localhost:8080 in a browser. This does **not** make the game available on your phone over the Internet.

## Publish Lite

Workflow [Publish HELIOS Venus Lite](.github/workflows/pages.yml) deploys static runtime files to GitHub Pages. **First enable Pages on this repository:** Settings → Pages → Build and deployment → Source: **GitHub Actions**. After a successful deployment the playable site should have an HTTPS URL.

## Story premise

A fictional classified Soviet Venus initiative leaves an archive in Russia. A brilliant, charismatic young engineer dismissed as a madman attempts to revive the project, then negotiates an international research and industrial effort. Fictional alternate-history premise, not a claim about Soviet history.

## Reality checks

- Engine values and mission durations are game-design abstractions, not validated orbital mechanics.
- Unreal/Unity builds and real device tests still need to be run.
- Player retention and revenue assumptions are unvalidated.
- GitHub repository visibility is currently **public**; do not commit credentials or employer source.

See [Venus campaign](design/VENUS_CAMPAIGN.md), [Venus acceptance criteria](design/VENUS_VERTICAL_SLICE.md), [Roadmap](design/ROADMAP.md), and [issues](https://github.com/Anatolichka2202/HELIOS/issues).
