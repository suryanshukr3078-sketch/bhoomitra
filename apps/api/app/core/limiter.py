from fastapi import Request
from slowapi import Limiter


def get_real_ip(request: Request) -> str:
    """
    Extracts client IP from proxy headers (X-Forwarded-For, X-Real-IP)
    with fallback to client.host.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    if request.client and request.client.host:
        return request.client.host

    return "127.0.0.1"


limiter = Limiter(
    key_func=get_real_ip,
    default_limits=["120/minute"],
    headers_enabled=True,
)
