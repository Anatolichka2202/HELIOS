# HELIOS concept trailer source

The reproducible source of the three first motion-design teasers lives here.

```sh
python -m pip install pillow numpy
sudo apt-get install ffmpeg
python tools/promos/render_promos.py --clip all
```

The script creates three MP4/H.264/AAC files next to itself:

- `HELIOS_Lite_Dossier_9x16.mp4` — 18 s, 720×1280, **released Lite browser URL**.
- `HELIOS_Mobile_Cloud_Service_9x16.mp4` — 18 s, 720×1280, **concept, not released**.
- `HELIOS_PC_Civilization_16x9.mp4` — 20 s, 960×540, **concept, not released**.

The background, art, moving objects and synthesized ambient soundtrack are generated in Python. No external video, photography, stock music, celebrity likeness, NASA identity or invented gameplay footage is embedded.

After the GitHub render workflow completes successfully, the actual binaries appear in [`media/promos/`](../../media/promos/). The workflow is manually rerunnable; it tracks changes and only commits outputs when rendered files differ.

## Legal / publishing status

The ads are **concept trailers**, not screenshots of a functioning Unity or Unreal game. The Lite CTA points to the actual project GitHub Pages site; PC and Mobile are labeled **in development**. Do not replace those labels with available-store claims until the products have published listings. The trailer is not a guarantee of features, release windows or launch prices.

## Visual upgrade plan

The next art production iteration should include approved original character portraits, interactive Venus cloud-city 3D assets, real Lite UI interaction shots and later actual Unreal/Unity gameplay capture. Movie-like environments must be distinguished from live gameplay. See [`design/PROMO_TRAILERS_2026-10.md`](../../design/PROMO_TRAILERS_2026-10.md).
