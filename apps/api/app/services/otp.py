import logging
import secrets
import string
from datetime import UTC, datetime, timedelta
from typing import Any

logger = logging.getLogger("bhoomitra.otp")

# In-memory OTP storage:
# keyed by lowercase email -> { "otp": str, "expires_at": datetime, "action": str, "attempts": int, "payload": dict }
_OTP_CACHE: dict[str, dict[str, Any]] = {}

OTP_EXPIRY_MINUTES = 10
MAX_VERIFY_ATTEMPTS = 5
RESEND_COOLDOWN_SECONDS = 30


def generate_secure_otp(length: int = 6) -> str:
    """Generates a cryptographically secure 6-digit numeric OTP."""
    digits = string.digits
    return "".join(secrets.choice(digits) for _ in range(length))


def store_otp(
    email: str,
    action: str,
    payload: dict[str, Any] | None = None,
    custom_otp: str | None = None,
) -> tuple[str, datetime]:
    """
    Stores an OTP for a specific email and action ('login' | 'register').
    Returns the generated OTP and its expiry timestamp.
    """
    normalized_email = email.lower().strip()
    otp_code = custom_otp or generate_secure_otp(6)
    expires_at = datetime.now(UTC) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    _OTP_CACHE[normalized_email] = {
        "otp": otp_code,
        "action": action,
        "expires_at": expires_at,
        "created_at": datetime.now(UTC),
        "attempts": 0,
        "payload": payload or {},
    }
    logger.info(f"[OTPService] Generated {action} OTP for {normalized_email} (valid until {expires_at.isoformat()})")
    return otp_code, expires_at


def verify_stored_otp(
    email: str,
    otp: str,
    action: str | None = None,
) -> tuple[bool, str, dict[str, Any] | None]:
    """
    Verifies a provided OTP for the given email and action.
    Returns: (is_valid: bool, error_or_success_message: str, stored_payload: dict | None)
    """
    normalized_email = email.lower().strip()
    record = _OTP_CACHE.get(normalized_email)

    if not record:
        return False, "No active OTP found for this email. Please request a new code.", None

    if action and record.get("action") != action:
        return False, f"Invalid OTP context for {action}.", None

    now = datetime.now(UTC)
    if now > record["expires_at"]:
        _OTP_CACHE.pop(normalized_email, None)
        return False, "This OTP has expired. Please request a new code.", None

    record["attempts"] += 1
    if record["attempts"] > MAX_VERIFY_ATTEMPTS:
        _OTP_CACHE.pop(normalized_email, None)
        return False, "Too many incorrect attempts. This OTP has been invalidated.", None

    if record["otp"] != otp.strip():
        remaining = MAX_VERIFY_ATTEMPTS - record["attempts"]
        return False, f"Incorrect verification code. ({remaining} attempt{'s' if remaining != 1 else ''} remaining)", None

    # Valid OTP verified: retrieve payload and clear cache
    payload = record.get("payload")
    _OTP_CACHE.pop(normalized_email, None)
    logger.info(f"[OTPService] Successfully verified {record.get('action')} OTP for {normalized_email}")
    return True, "Verification successful.", payload


def get_otp_for_debugging(email: str) -> str | None:
    """Helper for testing or simulation mode to inspect current active OTP."""
    record = _OTP_CACHE.get(email.lower().strip())
    if record and datetime.now(UTC) <= record["expires_at"]:
        return record["otp"]
    return None


def can_resend_otp(email: str) -> tuple[bool, int]:
    """Checks if cooldown period has elapsed since last OTP creation."""
    record = _OTP_CACHE.get(email.lower().strip())
    if not record:
        return True, 0

    now = datetime.now(UTC)
    created_at = record.get("created_at", now)
    elapsed = (now - created_at).total_seconds()
    if elapsed < RESEND_COOLDOWN_SECONDS:
        return False, int(RESEND_COOLDOWN_SECONDS - elapsed)
    return True, 0
