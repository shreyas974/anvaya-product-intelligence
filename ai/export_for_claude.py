"""
export_for_claude.py -- Codebase Bundler for Claude / External AI Sharing

WHAT: Bundles all project source code, schemas, and test files into a single
      clean Markdown/Text file ready to upload or paste directly into Claude.

WHY:  Makes it effortless to share the entire codebase with Claude in a single prompt or file.

USAGE:
    python ai/export_for_claude.py
"""

import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_FILE = ROOT_DIR / "ANVAYA_FULL_CODEBASE_BUNDLE.md"

INCLUDE_EXTENSIONS = {".py", ".toml", ".json", ".md"}
EXCLUDE_DIRS = {".git", ".venv", "__pycache__", ".pytest_cache", "weights", ".gemini"}
EXCLUDE_FILES = {"ANVAYA_FULL_CODEBASE_BUNDLE.md"}


def bundle_codebase():
    output_lines = [
        "# ANVAYA — AI Product Intelligence Platform (Codebase Bundle)\n\n",
        "## Overview\n",
        "This file contains the complete source code, architecture, schema definitions, ",
        "training loops, API services, and test suite for the Anvaya Product Intelligence platform.\n\n",
        "---\n\n",
    ]

    count = 0
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]

        for file in sorted(files):
            if file in EXCLUDE_FILES:
                continue

            file_path = Path(root) / file
            if file_path.suffix not in INCLUDE_EXTENSIONS:
                continue

            rel_path = file_path.relative_to(ROOT_DIR)
            rel_str = str(rel_path).replace("\\", "/")

            if not (rel_str.startswith("ai/") or rel_str.startswith("tests/") or "/" not in rel_str):
                continue

            try:
                content = file_path.read_text(encoding="utf-8")
            except Exception:
                continue

            lang = "python" if file_path.suffix == ".py" else ("toml" if file_path.suffix == ".toml" else "json")
            if file_path.suffix == ".md":
                lang = "markdown"

            output_lines.append(f"### File: `{rel_str}`\n\n```{lang}\n{content}\n```\n\n---\n\n")
            count += 1

    OUTPUT_FILE.write_text("".join(output_lines), encoding="utf-8")
    print(f"[+] Successfully bundled {count} files into: {OUTPUT_FILE}")
    print(f"[+] File Size: {os.path.getsize(OUTPUT_FILE) / 1024:.1f} KB")


if __name__ == "__main__":
    bundle_codebase()
