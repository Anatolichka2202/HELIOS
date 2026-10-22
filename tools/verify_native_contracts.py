#!/usr/bin/env python3
"""Conservative static contract audit. Not a substitute for Unity/Unreal compilation."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCENARIO = json.loads((ROOT / "shared/venus-scenario.json").read_text(encoding="utf-8"))
PROJECTS = {p["id"] for p in SCENARIO["projects"]}
POLICIES = set(SCENARIO["operations"]["policyOptions"])

def text(relative):
    return (ROOT / relative).read_text(encoding="utf-8")

def require(condition, message):
    if not condition:
        raise AssertionError(message)

def main():
    unity = text("mobile/Assets/Scripts/VenusSessionModel.cs")
    unreal = text("pc/Source/HELIOS/Private/VenusMissionSubsystem.cpp")
    lite = text("lite/engine.js")

    unity_ids = set(re.findall(r'new VenusProject\("([^"]+)"', unity))
    unreal_ids = set(re.findall(r'ProjectId == FName\(TEXT\("([^"]+)"\)\)', unreal))
    lite_ids = set(re.findall(r'\{id:"([^"]+)",zone:"(?:orbit|clouds|lower|surface)"', lite))

    for name, found in [
        ("Unity", unity_ids),
        ("Unreal", unreal_ids),
        ("Lite", lite_ids)
    ]:
        missing = PROJECTS - found
        extra = found - PROJECTS
        require(not missing and not extra,
                f"{name} project IDs differ; missing={sorted(missing)} extra={sorted(extra)}")

    for policy in POLICIES:
        require(f'"{policy}"' in unity, f"Unity missing policy {policy}")
        require(f'TEXT("{policy}")' in unreal, f"Unreal missing policy {policy}")
        require(f'{policy}:' in lite, f"Lite missing policy {policy}")

    for name in [
        "lite/index.html", "lite/style.css", "lite/engine.js", "lite/game.js",
        "lite/sw.js", "lite/manifest.webmanifest",
        "lite/assets/helios-icon.svg", "lite/assets/venus-clouds.svg",
        "pc/Source/HELIOS/Public/VenusMissionSubsystem.h",
        "pc/Source/HELIOS/Private/VenusMissionSubsystem.cpp",
        "mobile/Assets/Scripts/VenusPlayableBootstrap.cs"
    ]:
        require((ROOT / name).is_file(), f"Missing runtime or native scaffolding: {name}")

    manifest = json.loads(text("lite/manifest.webmanifest"))
    require(manifest["display"] == "standalone", "PWA must be installable")
    require((ROOT / "lite" / manifest["icons"][0]["src"]).is_file(), "Missing PWA icon")

    print(f"Static contracts: {len(PROJECTS)} projects and {len(POLICIES)} "
          "policies present in JS, C# and UE C++.")

if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, AssertionError) as exc:
        print(f"Native contract check failed: {exc}", file=sys.stderr)
        sys.exit(1)
