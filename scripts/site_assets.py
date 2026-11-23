"""Content-versioned URLs for the public site’s local assets."""
from hashlib import sha256
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def asset_url(path):
    relative = path.lstrip("/")
    version = sha256((ROOT / relative).read_bytes()).hexdigest()[:10]
    return f"/{relative}?v={version}"
