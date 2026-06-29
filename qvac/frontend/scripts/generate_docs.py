#!/usr/bin/env python3
"""Generate end-to-end frontend docs from the repository READMEs.

This script concatenates the root and directory READMEs into a single
readable document, generates a table of contents, and writes both a
Markdown source and a styled HTML page to public/docs/.

Run it after any README change:
    python3 qvac/frontend/scripts/generate_docs.py

Or via npm:
    npm run generate-docs
"""

from pathlib import Path
import re
import markdown

REPO_ROOT = Path(__file__).resolve().parents[3]
OUT_DIR = REPO_ROOT / "qvac" / "frontend" / "public" / "docs"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# READMEs are included in this order to create a coherent end-to-end read.
README_FILES = [
    REPO_ROOT / "README.md",
    REPO_ROOT / "sdk" / "README.md",
    REPO_ROOT / "providers" / "README.md",
    REPO_ROOT / "qvac" / "README.md",
    REPO_ROOT / "qvac" / "src" / "README.md",
    REPO_ROOT / "apps" / "README.md",
    REPO_ROOT / "docs" / "UPSTREAM.md",
    REPO_ROOT / "inference-README.md",
    REPO_ROOT / "contracts" / "README.md",
    REPO_ROOT / "contracts-casper" / "README.md",
    REPO_ROOT / "scripts" / "README.md",
]


def read_readme(path: Path) -> str:
    if not path.exists():
        return f"\n> _README not found: {path.relative_to(REPO_ROOT)}_\n"
    text = path.read_text(encoding="utf-8")
    # Remove the top-level heading because we will add our own section header.
    text = re.sub(r"^#\s+.*\n", "", text, count=1)
    return text


def main():
    parts = [
        "# Localchimera Documentation\n\n"
        "> This document is generated from the repository READMEs. "
        "Edit the README files and run `npm run generate-docs` to update it.\n"
    ]

    for path in README_FILES:
        rel = path.relative_to(REPO_ROOT)
        title = path.parent.name.upper() if path.parent != REPO_ROOT else "PROJECT OVERVIEW"
        if title == "README":
            title = path.parents[1].name.upper() if len(path.parents) > 1 else "OVERVIEW"
        parts.append(f"\n\n---\n\n## {title}\n\n<!-- Source: {rel} -->\n\n")
        parts.append(read_readme(path))

    combined_md = "".join(parts)
    (OUT_DIR / "LOCALCHIMERA.md").write_text(combined_md, encoding="utf-8")

    # Convert to HTML with a table of contents.
    md = markdown.Markdown(extensions=["toc"])
    body_html = md.convert(combined_md)
    toc_html = md.toc

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Localchimera Documentation</title>
  <style>
    :root {{ color-scheme: dark; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
      background: #030308;
      color: #e8e2d8;
    }}
    h1, h2, h3 {{ color: #fff; margin-top: 2rem; }}
    h1 {{ border-bottom: 2px solid #a855f7; padding-bottom: 0.5rem; }}
    h2 {{ border-bottom: 1px solid #333; padding-bottom: 0.3rem; }}
    a {{ color: #00e5ff; text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    code {{
      background: #1a1a2e;
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    }}
    pre {{
      background: #1a1a2e;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }}
    pre code {{ background: transparent; padding: 0; }}
    table {{
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }}
    th, td {{
      border: 1px solid #333;
      padding: 0.6rem;
      text-align: left;
    }}
    th {{ background: #1a1a2e; color: #fff; }}
    blockquote {{
      border-left: 4px solid #a855f7;
      margin: 1rem 0;
      padding-left: 1rem;
      color: #b0a89e;
    }}
    hr {{ border: 0; border-top: 1px solid #333; margin: 2rem 0; }}
    .toc {{ background: #1a1a2e; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }}
    .toc ul {{ list-style-type: none; padding-left: 0; }}
    .toc li {{ margin: 0.3rem 0; }}
  </style>
</head>
<body>
  <a href="/">&larr; Back to app</a>
  <div class="toc">
    <strong>Table of Contents</strong>
    {toc_html}
  </div>
  <main>
    {body_html}
  </main>
</body>
</html>
"""

    (OUT_DIR / "LOCALCHIMERA.html").write_text(html, encoding="utf-8")
    print(f"Generated {OUT_DIR / 'LOCALCHIMERA.md'} and {OUT_DIR / 'LOCALCHIMERA.html'}")


if __name__ == "__main__":
    main()
