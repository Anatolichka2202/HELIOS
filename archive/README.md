# HELIOS historical prototypes

These sources are **historical snapshots**, not shipping dependencies.

- `p1-python/`: first headless research model from `HELIOS_headless_P1.zip` (five tests).
- `lite-0.1/`: original single-file clickable HTML prototype from conversation attachment.
- `lite-0.2/`: logistics iteration in `HELIOS_multitrack_0_2.zip`; **full unmodified HTML/JS snapshot not yet imported**. A modified successor is in `lite/`. Keep the original ZIP archived separately until exact-file import is possible.

Why keep them? To preserve reasoning history, prototype mechanics and the ability to compare early design decisions without contaminating production builds.

**Do not** import modules from `archive/` into active clients. Browser entry point is `lite/index.html`. Production core is currently a future architectural goal; `core/` is a separate research codebase.
