import sys
from pathlib import Path

# Add apps/api to sys.path
root_dir = Path(__file__).resolve().parent
apps_api_dir = root_dir.parent / "apps" / "api"
if not apps_api_dir.exists():
    apps_api_dir = root_dir / "apps" / "api"
if not apps_api_dir.exists():
    apps_api_dir = Path.cwd() / "apps" / "api"

if apps_api_dir.exists() and str(apps_api_dir) not in sys.path:
    sys.path.insert(0, str(apps_api_dir))

from app.core.middleware import QueryPathRewriteMiddleware
from app.main import app

__all__ = ["app", "QueryPathRewriteMiddleware"]
