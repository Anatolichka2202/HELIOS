# HELIOS — Solar Civilization

Multi-platform strategy project about human expansion across the **entire Solar System**. The **first vertical slice focuses on Venus**, with both a story campaign and sandbox sessions.

> Early development: source code and prototypes are here, but no production game or verified mobile/UE build is claimed.

## Start here — concept, architecture and what the code really does

**[Документы HELIOS: общий замысел + три спецификации + игровая и коммерческая экономика](design/00_INDEX.md)**

**[Код для новичка: где что лежит и как работает](docs/START_HERE.md)** · **[Плейтест Venus 0.7](docs/PLAYTEST_VENUS_0_7.md)** · **[Предыдущая поставка 0.6](docs/IMPLEMENTATION_0_6.md)**

**[Полная карта кода](docs/CODEBASE_MAP.md)** · **[Технический аудит](docs/TECHNICAL_AUDIT.md)**

Decisions (draft 0.3): whole Solar System franchise; **Venus-only first campaign and sessions**. PC — UE5 narrative industrial strategy with limited first-person episodes, Mobile — Unity C# touch-first colony/logistics strategy, Lite — browser turn-based economic/narrative strategy. All single-player experiences must work offline; servers are optional later.

These are **product specifications, not claims of implemented features**. See the actual codebase map for the implemented state.


## Workstreams

| Directory | Purpose | Current status |
|---|---|---|
| [lite/](lite/) | Browser Venus Initiative | Venus 0.7 source, production/tradeoff loop, PWA/cache, backup saves; real iPhone test pending |
| [pc/](pc/) | Unreal Engine 5 / C++ flagship | UE mission subsystem, keyboard prototype, 3D scene + in-world console; build unverified |
| [mobile/](mobile/) | Unity / C# for Android/iOS | Venus scene preview and mission catalog; device builds unverified |
| [core/](core/) | C++ simulation research prototype | CMake and smoke test |
| [shared/](shared/) | Cross-platform data contracts | Venus schema v5; Lite 0.7 experimental mechanics documented; static ID contract across clients, not yet runtime-integrated |
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

## Venus 0.7 gameplay update

The browser prototype now includes two distinct aerostat engineering designs, staggered commissioning of major facilities, a consequential acid-front crisis, unlockable corrosion-resistant materials, energy/supply-dependent mission viability and different campaign epilogues. The Lite simulation and schema/UI smoke suite contains **61 tests** that passed in a controlled JS harness. These are **not measured retention metrics** or verified native mobile/PC builds.

[Playtest on phone and report whether it's actually fun](docs/PLAYTEST_VENUS_0_7.md). The prior `mobile/` Unity and `pc/` Unreal sources remain a separate, older vertical slice and are not yet at Lite 0.7 rules parity.
