import sys
from pathlib import Path

# Add apps/api root directory to sys.path so that 'app' package imports succeed
API_ROOT = Path(__file__).resolve().parent.parent
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app.main import app

# Expose ASGI application instance for Vercel serverless Python runtime
__all__ = ["app"]
