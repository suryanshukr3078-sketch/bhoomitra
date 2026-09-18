import json
import logging
import smtplib
import socket
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from app.core.config import settings

try:
    from app.static.logo_base64 import TEAM_CODENOVA_LOGO_BASE64
except ImportError:
    TEAM_CODENOVA_LOGO_BASE64 = ""

logger = logging.getLogger("bhoomitra.email")


class EmailDeliveryResult(dict):
    """
    Result container for email operations.
    Inherits from dict and evaluates as boolean based on 'success'.
    Allows both bool(result) checks and dict property access.
    """
    def __init__(
        self,
        success: bool,
        status: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            success=success,
            status=status,
            message=message,
            details=details or {},
        )

    def __bool__(self) -> bool:
        return bool(self.get("success", False))

    @property
    def success(self) -> bool:
        return bool(self.get("success", False))

    @property
    def status(self) -> str:
        return str(self.get("status", "unknown"))

    @property
    def message(self) -> str:
        return str(self.get("message", ""))


def _build_welcome_email_html(
    full_name: str,
    to_email: str,
    org_name: str,
    category_title: str,
    role_title: str,
    is_pending: bool,
) -> str:
    status_badge_bg = "#fef3c7" if is_pending else "#ecfdf5"
    status_badge_text = "#92400e" if is_pending else "#065f46"
    status_badge_border = "#fde68a" if is_pending else "#a7f3d0"
    status_title = "Verification Pending" if is_pending else "Account Active & Ready"
    status_icon = "⏳" if is_pending else "✓"

    status_message = (
        "Your registration has been submitted under an official Government or Policy jurisdiction. "
        "Cadastral write privileges and statutory amendments require verification by platform administrators. "
        "You will receive a follow-up confirmation as soon as verification is complete."
        if is_pending
        else "Your account has been provisioned and is active immediately. You can now access your institutional "
        "workspace, search cadastral datasets, explore spatial maps, and contribute research outputs."
    )

    action_button_text = "Access Platform Login" if is_pending else "Sign In to Workspace"
    action_button_url = "https://web-rho-gules-89.vercel.app/login"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Bhoomitra</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Brand Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%); padding: 36px 32px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 8px; padding: 6px 12px; margin-bottom: 12px;">
                      <span style="font-size: 11px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                        🏛️ National Cadastral Platform
                      </span>
                    </div>
                    <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2;">
                      Bhoomitra
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 14px; color: #a7f3d0; font-weight: 500;">
                      Integrated Land Governance & Spatial Intelligence Network
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Salutation & Status -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                Welcome, {full_name}!
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for registering on <strong>Bhoomitra</strong>. Your institutional registration for 
                <strong style="color: #047857;">{org_name}</strong> has been successfully recorded in the platform directory.
              </p>

              <!-- Status Alert Box -->
              <div style="background-color: {status_badge_bg}; border: 1px solid {status_badge_border}; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;">
                <div style="display: flex; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 15px; margin-right: 8px;">{status_icon}</span>
                  <span style="font-size: 13px; font-weight: 700; color: {status_badge_text}; text-transform: uppercase; letter-spacing: 0.5px;">
                    {status_title}
                  </span>
                </div>
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: {status_badge_text};">
                  {status_message}
                </p>
              </div>

              <!-- Registration Details Table -->
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
                Registration Summary
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 28px; font-size: 13px;">
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 16px; font-weight: 600; color: #64748b; width: 38%;">Registered Name</td>
                  <td style="padding: 10px 16px; font-weight: 700; color: #0f172a;">{full_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 16px; font-weight: 600; color: #64748b;">Registered Email</td>
                  <td style="padding: 10px 16px; font-weight: 600; color: #047857;">{to_email}</td>
                </tr>
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 16px; font-weight: 600; color: #64748b;">Organization / Institute</td>
                  <td style="padding: 10px 16px; font-weight: 600; color: #0f172a;">{org_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 16px; font-weight: 600; color: #64748b;">Category</td>
                  <td style="padding: 10px 16px; font-weight: 600; color: #0f172a;">{category_title}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 16px; font-weight: 600; color: #64748b;">Designation / Cadre</td>
                  <td style="padding: 10px 16px; font-weight: 600; color: #0f172a;">{role_title}</td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="{action_button_url}" target="_blank" style="display: inline-block; background-color: #047857; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 6px rgba(4, 120, 87, 0.3);">
                      {action_button_text} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Helpful Resource Links -->
              <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px; font-size: 12px; color: #475569; line-height: 1.6;">
                <p style="margin: 0 0 6px 0; font-weight: 700; color: #1e293b;">Quick Explorer Resources:</p>
                <ul style="margin: 0; padding-left: 18px;">
                  <li><a href="https://web-rho-gules-89.vercel.app/maps" style="color: #047857; text-decoration: none; font-weight: 600;">Interactive Cadastral GIS Maps</a> &mdash; View state parcels & boundaries.</li>
                  <li><a href="https://web-rho-gules-89.vercel.app/research" style="color: #047857; text-decoration: none; font-weight: 600;">Research Publications</a> &mdash; Discover peer-reviewed land studies.</li>
                  <li><a href="https://web-rho-gules-89.vercel.app/assistant" style="color: #047857; text-decoration: none; font-weight: 600;">Cadastral AI Assistant</a> &mdash; Get instant answers to land tenure laws.</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Security & Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
              <p style="margin: 0 0 6px 0;">
                🔒 Security Note: Bhoomitra will never ask for your password or hardware DSC tokens via email.
              </p>
              <p style="margin: 0;">
                Bhoomitra &bull; National Cadastral & Land Governance Platform &bull; All Rights Reserved.<br>
                For questions or support, contact <a href="mailto:support@bhoomitra.gov.in" style="color: #047857; text-decoration: underline;">support@bhoomitra.gov.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _build_welcome_email_text(
    full_name: str,
    to_email: str,
    org_name: str,
    category_title: str,
    role_title: str,
    is_pending: bool,
) -> str:
    status_title = "Verification Pending" if is_pending else "Account Active & Ready"
    return f"""Welcome to Bhoomitra!

Dear {full_name},

Thank you for registering on Bhoomitra — National Cadastral & Land Governance Platform.
Your institutional registration for {org_name} has been successfully recorded.

ACCOUNT STATUS: {status_title}
--------------------------------------------------
- Registered Name: {full_name}
- Registered Email: {to_email}
- Organization / Institute: {org_name}
- Category: {category_title}
- Designation: {role_title}

Portal Login: https://web-rho-gules-89.vercel.app/login
Cadastral Maps: https://web-rho-gules-89.vercel.app/maps
Research Publications: https://web-rho-gules-89.vercel.app/research

If you did not initiate this registration, please contact support@bhoomitra.gov.in.

Best regards,
The Bhoomitra Team
"""
import uuid
from datetime import datetime, timezone

_RUNTIME_CONFIG: dict[str, Any] = {}
_EMAIL_LOGS: list[dict[str, Any]] = []


def get_effective_email_config() -> dict[str, Any]:
    global _RUNTIME_CONFIG
    if _RUNTIME_CONFIG.get("password") or _RUNTIME_CONFIG.get("api_key"):
        return dict(_RUNTIME_CONFIG)
    import os
    if os.environ.get("PYTEST_CURRENT_TEST") or getattr(settings, "app_env", "") == "testing":
        return dict(_RUNTIME_CONFIG)
    try:
        import psycopg
        raw_url = str(settings.database_url)
        sync_url = raw_url.replace("postgresql+psycopg://", "postgresql://").replace("postgresql+asyncpg://", "postgresql://")
        with psycopg.connect(sync_url, connect_timeout=4) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT value FROM system_settings WHERE key = 'smtp_config'")
                row = cur.fetchone()
                if row and row[0]:
                    val = row[0] if isinstance(row[0], dict) else json.loads(row[0])
                    if isinstance(val, dict):
                        _RUNTIME_CONFIG.update(val)
    except Exception as e:
        logger.debug(f"[EmailService] Could not load DB smtp config: {e}")
    return dict(_RUNTIME_CONFIG)


def get_runtime_smtp_config() -> dict[str, Any]:
    return get_effective_email_config()


def configure_runtime_smtp(config: dict[str, Any]) -> None:
    global _RUNTIME_CONFIG
    _RUNTIME_CONFIG.update(config)
    try:
        import psycopg
        raw_url = str(settings.database_url)
        sync_url = raw_url.replace("postgresql+psycopg://", "postgresql://").replace("postgresql+asyncpg://", "postgresql://")
        with psycopg.connect(sync_url, connect_timeout=4) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO system_settings (key, value, updated_at) VALUES ('smtp_config', %s, NOW()) "
                    "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
                    (json.dumps(_RUNTIME_CONFIG),),
                )
                conn.commit()
    except Exception as e:
        logger.warning(f"[EmailService] Failed to persist SMTP config in DB: {e}")


def reset_runtime_smtp() -> None:
    global _RUNTIME_CONFIG
    _RUNTIME_CONFIG = {}
    import os
    if os.environ.get("PYTEST_CURRENT_TEST") or getattr(settings, "app_env", "") == "testing":
        return
    try:
        import psycopg
        raw_url = str(settings.database_url)
        sync_url = raw_url.replace("postgresql+psycopg://", "postgresql://").replace("postgresql+asyncpg://", "postgresql://")
        with psycopg.connect(sync_url, connect_timeout=4) as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM system_settings WHERE key = 'smtp_config'")
                conn.commit()
    except Exception as e:
        logger.warning(f"[EmailService] Failed to delete SMTP config from DB: {e}")


def get_email_logs(limit: int = 50) -> list[dict[str, Any]]:
    return _EMAIL_LOGS[-limit:][::-1]


def get_email_log_by_id(email_id: str) -> dict[str, Any] | None:
    for log in _EMAIL_LOGS:
        if log.get("id") == email_id:
            return log
    return None


def record_email_log(
    to_email: str,
    subject: str,
    html_body: str,
    status: str,
    message: str,
    channel: str,
    details: dict[str, Any] | None = None,
) -> dict[str, Any]:
    entry = {
        "id": str(uuid.uuid4()),
        "to_email": to_email,
        "subject": subject,
        "html_body": html_body,
        "status": status,
        "message": message,
        "channel": channel,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "details": details or {},
    }
    _EMAIL_LOGS.append(entry)
    if len(_EMAIL_LOGS) > 100:
        del _EMAIL_LOGS[0]
    return entry


def is_smtp_configured() -> bool:
    """Returns True if email credentials (SMTP or API key) are configured."""
    cfg = get_effective_email_config()
    if cfg.get("api_key") or (cfg.get("user") and cfg.get("password")):
        return True
    return bool(settings.smtp_user and settings.smtp_password)


def get_smtp_status() -> dict[str, Any]:
    """Provides public diagnostic status without exposing sensitive credentials."""
    cfg = get_effective_email_config()
    user = cfg.get("user") or settings.smtp_user
    host = cfg.get("host") or settings.smtp_host
    port = int(cfg.get("port") or settings.smtp_port or 587)
    use_ssl = bool(cfg.get("use_ssl") if "use_ssl" in cfg else (settings.smtp_ssl or port == 465))
    use_tls = bool(cfg.get("use_tls") if "use_tls" in cfg else (settings.smtp_tls and not use_ssl))
    from_email = cfg.get("from_email") or settings.smtp_from_email or user or "support@bhoomitra.gov.in"
    from_name = cfg.get("from_name") or settings.smtp_from_name or "Bhoomitra Land Governance Platform"

    api_key = cfg.get("api_key", "")
    provider = cfg.get("provider")
    if not provider:
        if api_key.startswith("re_"):
            provider = "resend"
        elif api_key.startswith("xkeysib-"):
            provider = "brevo"
        elif "gmail" in host.lower():
            provider = "gmail_smtp"
        elif "brevo" in host.lower():
            provider = "brevo_smtp"
        elif "sendgrid" in host.lower():
            provider = "sendgrid_smtp"
        else:
            provider = "smtp"

    masked_user = None
    if user:
        if "@" in user:
            local, domain = user.split("@", 1)
            masked_user = f"{local[:2]}***@{domain}"
        else:
            masked_user = f"{user[:2]}***"

    is_configured = is_smtp_configured()

    return {
        "configured": is_configured,
        "provider": provider,
        "host": host,
        "port": port,
        "protocol": "HTTP API" if provider in ("resend", "brevo") else ("SSL" if use_ssl else ("STARTTLS" if use_tls else "PLAIN")),
        "from_email": from_email,
        "from_name": from_name,
        "user_masked": masked_user,
        "outbox_count": len(_EMAIL_LOGS),
        "runtime_override_active": bool(_RUNTIME_CONFIG),
    }


def _attempt_http_api_dispatch(
    provider: str,
    api_key: str,
    from_email: str,
    from_name: str,
    to_email: str,
    subject: str,
    html_body: str,
    text_body: str | None = None,
) -> tuple[bool, str]:
    import httpx
    try:
        sender_str = f"{from_name} <{from_email}>" if from_name else from_email
        if provider == "resend" or api_key.startswith("re_"):
            with httpx.Client(timeout=10.0) as client:
                res = client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "from": sender_str,
                        "to": [to_email],
                        "subject": subject,
                        "html": html_body,
                    },
                )
                if res.status_code in (200, 201):
                    data = res.json()
                    msg_id = data.get("id", "ok")
                    return True, f"Successfully dispatched via Resend API (id: {msg_id})"
                else:
                    return False, f"Resend API error ({res.status_code}): {res.text}"
        elif provider == "brevo" or api_key.startswith("xkeysib-"):
            with httpx.Client(timeout=10.0) as client:
                res = client.post(
                    "https://api.brevo.com/v3/smtp/email",
                    headers={"api-key": api_key},
                    json={
                        "sender": {"name": from_name, "email": from_email},
                        "to": [{"email": to_email}],
                        "subject": subject,
                        "htmlContent": html_body,
                    },
                )
                if res.status_code in (200, 201):
                    return True, "Successfully dispatched via Brevo HTTP API"
                else:
                    return False, f"Brevo API error ({res.status_code}): {res.text}"
        else:
            return False, f"Unknown HTTP email provider: {provider}"
    except Exception as exc:
        return False, f"HTTP API dispatch failed: {type(exc).__name__}: {exc}"


def _attempt_smtp_dispatch(
    host: str,
    port: int,
    use_ssl: bool,
    use_tls: bool,
    user: str,
    password: str,
    from_email: str,
    to_email: str,
    msg_str: str,
    timeout: float = 8.0,
) -> tuple[bool, str]:
    """Attempts a single SMTP connection, authentication, and transmission."""
    try:
        if use_ssl:
            ctx = ssl.create_default_context()
            server: smtplib.SMTP = smtplib.SMTP_SSL(host, port, context=ctx, timeout=timeout)
        else:
            server = smtplib.SMTP(host, port, timeout=timeout)
            server.ehlo()
            if use_tls:
                ctx = ssl.create_default_context()
                server.starttls(context=ctx)
                server.ehlo()

        server.login(user, password)
        server.sendmail(from_email, [to_email], msg_str)
        server.quit()
        return True, f"Successfully dispatched email to {to_email} via {host}:{port} ({'SSL' if use_ssl else 'STARTTLS'})"
    except smtplib.SMTPAuthenticationError as auth_err:
        err_msg = str(auth_err.smtp_error or auth_err)
        if "5.7.8" in err_msg or "5.7.9" in err_msg or "BadCredentials" in err_msg or "Application-specific password" in err_msg:
            return False, (
                f"SMTP Authentication Error ({auth_err.smtp_code}): Google rejected the credentials. "
                "For Gmail, you MUST use a 16-character Google App Password (not your primary password) "
                "generated under Google Account Security -> 2-Step Verification -> App Passwords."
            )
        return False, f"SMTP Authentication Error ({auth_err.smtp_code}): {err_msg}"
    except (socket.timeout, TimeoutError):
        return False, f"SMTP connection timed out connecting to {host}:{port} after {timeout}s"
    except (ConnectionRefusedError, socket.gaierror) as conn_err:
        return False, f"SMTP network error connecting to {host}:{port}: {conn_err}"
    except Exception as exc:
        return False, f"SMTP dispatch failed: {type(exc).__name__}: {exc}"


def send_email_sync(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: str | None = None,
    runtime_config: dict[str, Any] | None = None,
) -> EmailDeliveryResult:
    """
    Sends an email using configured channel (HTTP API via Resend/Brevo, or standard SMTP with failover).
    If email credentials are not configured, logs simulated delivery and returns a simulated result.
    Records every delivery attempt into the in-memory outbox audit log.
    Never raises an unhandled exception.
    """
    if not to_email:
        logger.warning("[EmailService] No recipient email specified.")
        res = EmailDeliveryResult(
            success=False,
            status="failed",
            message="No recipient email specified.",
        )
        record_email_log(to_email, subject, html_body, "failed", "No recipient email specified.", "none")
        return res

    cfg = {**get_effective_email_config(), **(runtime_config or {})}
    api_key = cfg.get("api_key") or ""
    provider = cfg.get("provider") or ("resend" if api_key.startswith("re_") else ("brevo" if api_key.startswith("xkeysib-") else ""))

    # 1. HTTP API Dispatch (Resend or Brevo)
    if provider in ("resend", "brevo") and api_key:
        from_email = cfg.get("from_email") or settings.smtp_from_email or "support@bhoomitra.gov.in"
        from_name = cfg.get("from_name") or settings.smtp_from_name or "Bhoomitra Land Governance Platform"
        http_success, http_msg = _attempt_http_api_dispatch(
            provider=provider,
            api_key=api_key,
            from_email=from_email,
            from_name=from_name,
            to_email=to_email,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
        )
        record_email_log(
            to_email=to_email,
            subject=subject,
            html_body=html_body,
            status="sent" if http_success else "failed",
            message=http_msg,
            channel=provider,
            details={"provider": provider},
        )
        return EmailDeliveryResult(
            success=http_success,
            status="sent" if http_success else "failed",
            message=http_msg,
            details={"provider": provider},
        )

    # 2. Standard SMTP Dispatch
    smtp_user = cfg.get("user") or settings.smtp_user
    smtp_password = cfg.get("password") or settings.smtp_password

    # If SMTP credentials are not configured, simulate email dispatch safely
    if not (smtp_user and smtp_password):
        logger.info(
            f"[EmailService] SMTP credentials not set (SMTP_USER/SMTP_PASSWORD). "
            f"Simulated welcome email delivery to: {to_email} (Subject: '{subject}')"
        )
        record_email_log(
            to_email=to_email,
            subject=subject,
            html_body=html_body,
            status="simulated",
            message="Simulated email delivery: SMTP_USER or SMTP_PASSWORD not configured on server.",
            channel="simulated",
            details={"to": to_email, "subject": subject},
        )
        return EmailDeliveryResult(
            success=True,
            status="simulated",
            message="Simulated email delivery: SMTP_USER or SMTP_PASSWORD not configured on server.",
            details={"to": to_email, "subject": subject},
        )

    from email.header import Header
    from email.utils import formataddr

    from_email = cfg.get("from_email") or settings.smtp_from_email or smtp_user
    from_name = cfg.get("from_name") or settings.smtp_from_name
    sender_header = formataddr((str(Header(from_name, "utf-8")), from_email)) if from_name else from_email

    msg = MIMEMultipart("alternative")
    msg["Subject"] = str(Header(subject, "utf-8"))
    msg["From"] = sender_header
    msg["To"] = to_email

    if text_body:
        msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    msg_str = msg.as_string()

    host = cfg.get("host") or settings.smtp_host
    port = int(cfg.get("port") or settings.smtp_port or 587)
    use_ssl = bool(cfg.get("use_ssl") if "use_ssl" in cfg else (settings.smtp_ssl or port == 465))
    use_tls = bool(cfg.get("use_tls") if "use_tls" in cfg else (settings.smtp_tls and not use_ssl))

    success, message = _attempt_smtp_dispatch(
        host=host,
        port=port,
        use_ssl=use_ssl,
        use_tls=use_tls,
        user=smtp_user,
        password=smtp_password,
        from_email=from_email,
        to_email=to_email,
        msg_str=msg_str,
        timeout=8.0,
    )

    # If primary attempt failed and host is smtp.gmail.com, attempt failover between port 587 and 465
    if not success and host.lower() == "smtp.gmail.com":
        alt_port = 465 if port != 465 else 587
        alt_ssl = (alt_port == 465)
        alt_tls = not alt_ssl
        logger.info(f"[EmailService] Primary port {port} attempt returned: {message}. Trying fallback port {alt_port}...")
        alt_success, alt_message = _attempt_smtp_dispatch(
            host=host,
            port=alt_port,
            use_ssl=alt_ssl,
            use_tls=alt_tls,
            user=smtp_user,
            password=smtp_password,
            from_email=from_email,
            to_email=to_email,
            msg_str=msg_str,
            timeout=8.0,
        )
        if alt_success:
            logger.info(f"[EmailService] Fallback to port {alt_port} succeeded!")
            record_email_log(to_email, subject, html_body, "sent", alt_message, "smtp", {"host": host, "port": alt_port, "failover": True})
            return EmailDeliveryResult(
                success=True,
                status="sent",
                message=alt_message,
                details={"host": host, "port": alt_port, "failover_used": True},
            )
        else:
            final_message = alt_message if "Authentication Error" in alt_message else message
            logger.error(f"[EmailService] Both primary ({port}) and fallback ({alt_port}) failed. Reason: {final_message}")
            record_email_log(to_email, subject, html_body, "failed", final_message, "smtp", {"host": host, "ports": [port, alt_port]})
            return EmailDeliveryResult(
                success=False,
                status="failed",
                message=final_message,
                details={"host": host, "ports_tested": [port, alt_port]},
            )

    record_email_log(to_email, subject, html_body, "sent" if success else "failed", message, "smtp", {"host": host, "port": port})
    if success:
        logger.info(f"[EmailService] Successfully sent email to {to_email}: '{subject}'")
        return EmailDeliveryResult(
            success=True,
            status="sent",
            message=message,
            details={"host": host, "port": port},
        )
    else:
        logger.error(f"[EmailService] Failed to send email to {to_email}: {message}")
        return EmailDeliveryResult(
            success=False,
            status="failed",
            message=message,
            details={"host": host, "port": port},
        )


def send_welcome_email(
    to_email: str,
    full_name: str,
    org_name: str,
    category_title: str,
    role_title: str,
    is_pending: bool,
) -> EmailDeliveryResult:
    """
    Constructs and dispatches the bespoke welcome email.
    Returns EmailDeliveryResult which acts as both a dict and a boolean.
    """
    subject = f"Welcome to Bhoomitra, {full_name} | Institutional Registration"
    html_body = _build_welcome_email_html(
        full_name=full_name,
        to_email=to_email,
        org_name=org_name,
        category_title=category_title,
        role_title=role_title,
        is_pending=is_pending,
    )
    text_body = _build_welcome_email_text(
        full_name=full_name,
        to_email=to_email,
        org_name=org_name,
        category_title=category_title,
        role_title=role_title,
        is_pending=is_pending,
    )

    return send_email_sync(
        to_email=to_email,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )


def _build_otp_email_html(
    to_email: str,
    otp_code: str,
    full_name: str,
    action_type: str = "login",
) -> str:
    action_title = "Two-Factor Verification Code" if action_type == "login" else "Registration Verification Code"
    action_purpose = (
        "Your One-Time Password (OTP) for authenticating your session into Bhoomitra is:"
        if action_type == "login"
        else "Your One-Time Password (OTP) for completing your platform registration is:"
    )

    logo_src = (
        f"data:image/png;base64,{TEAM_CODENOVA_LOGO_BASE64}"
        if TEAM_CODENOVA_LOGO_BASE64
        else "https://web-rho-gules-89.vercel.app/images/team-codenova-logo.png"
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{action_title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b1120; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #111827; border-radius: 18px; overflow: hidden; border: 1px solid #1f2937; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
          
          <!-- TEAM CODENOVA Branded Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px; text-align: center; border-bottom: 3px solid #10b981;">
              <img src="{logo_src}" alt="TEAM CODENOVA" style="max-height: 52px; width: auto; display: inline-block;" />
            </td>
          </tr>

          <!-- Sub-header Title -->
          <tr>
            <td style="background: linear-gradient(180deg, #111827 0%, #1e293b 100%); padding: 24px 32px 12px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: -0.3px;">
                Bhoomitra Land Governance Platform
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                Powered by Team CodeNova Security Architecture
              </p>
            </td>
          </tr>

          <!-- OTP Content Body -->
          <tr>
            <td style="padding: 24px 32px 32px 32px;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #ffffff;">
                Hello {full_name or 'User'},
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                {action_purpose}
              </p>

              <!-- 6-Digit OTP Box (Matches reference screenshot style) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center">
                    <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px 24px; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">
                      <div style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #ffffff; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);">
                        {otp_code}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <div style="background-color: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #fbbf24; line-height: 1.5; font-weight: 500;">
                  ⏳ <strong>This OTP is valid for 10 minutes.</strong> Please do not share this one-time code with anyone.
                </p>
              </div>

              <!-- Automated message note -->
              <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                This is an automated 2-Factor Authentication message from Bhoomitra &bull; Team CodeNova. If you did not initiate this request, please change your credentials immediately or contact support.
              </p>
            </td>
          </tr>

          <!-- Footer with Branding -->
          <tr>
            <td style="background-color: #0f172a; border-top: 1px solid #1e293b; padding: 20px 32px; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #94a3b8;">
                TEAM CODENOVA &bull; Bhoomitra National Cadastral Platform
              </p>
              <p style="margin: 0;">
                All Rights Reserved &bull; Secure 2FA Protocol Enabled
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _build_otp_email_text(
    to_email: str,
    otp_code: str,
    full_name: str,
    action_type: str = "login",
) -> str:
    action_title = "Two-Factor Verification Code" if action_type == "login" else "Registration Verification Code"
    return f"""TEAM CODENOVA - Bhoomitra 2FA Verification
==================================================

Hello {full_name or 'User'},

{action_title} for Bhoomitra:

    >>>  {otp_code}  <<<

This OTP is valid for 10 minutes. Please do not share it with anyone.

If you did not request this verification code, please ignore this email or secure your account.

Regards,
Team CodeNova & Bhoomitra Platform
https://web-rho-gules-89.vercel.app
"""


def send_otp_email(
    to_email: str,
    otp_code: str,
    full_name: str = "",
    action_type: str = "login",
) -> EmailDeliveryResult:
    """
    Constructs and dispatches the 2FA OTP email containing Team CodeNova branding.
    """
    action_desc = "Login 2FA" if action_type == "login" else "Registration 2FA"
    subject = f"{otp_code} is your Bhoomitra {action_desc} Code | Team CodeNova"
    html_body = _build_otp_email_html(
        to_email=to_email,
        otp_code=otp_code,
        full_name=full_name,
        action_type=action_type,
    )
    text_body = _build_otp_email_text(
        to_email=to_email,
        otp_code=otp_code,
        full_name=full_name,
        action_type=action_type,
    )

    return send_email_sync(
        to_email=to_email,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )

