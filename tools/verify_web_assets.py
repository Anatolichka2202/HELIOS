#!/usr/bin/env python3
"""Validate static HELIOS Lite assets using only Python stdlib."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "lite"

class Resources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script" and attrs.get("src"):
            self.paths.append(attrs["src"])
        if tag == "link" and attrs.get("href"):
            self.paths.append(attrs["href"])
        if tag == "img" and attrs.get("src"):
            self.paths.append(attrs["src"])

def main():
    html = (SITE / "index.html").read_text(encoding="utf-8")
    css = (SITE / "style.css").read_text(encoding="utf-8")
    parser = Resources()
    parser.feed(html)
    for quoted, unquoted in re.findall(r"url\(\s*(?:['\"]([^'\"]+)['\"]|([^\)\s]+))\s*\)", css):
        parser.paths.append(quoted or unquoted)
    checked = []
    for value in parser.paths:
        if value.startswith(("http:", "https:", "data:", "#")):
            continue
        resolved = (SITE / value).resolve()
        if not resolved.is_relative_to(SITE.resolve()):
            raise RuntimeError(f"Asset escapes site directory: {value}")
        if not resolved.is_file():
            raise FileNotFoundError(f"Referenced asset not found: {value}")
        if resolved.suffix.lower() == ".svg":
            ET.parse(resolved)
        checked.append(value)
    if "assets/venus-clouds.svg" not in checked:
        raise RuntimeError("Venus artwork is not used by runtime stylesheet")
    print(f"Verified {len(checked)} referenced site resources: {', '.join(checked)}")

if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, RuntimeError, ET.ParseError) as exc:
        print(f"Asset check failed: {exc}", file=sys.stderr)
        sys.exit(1)
