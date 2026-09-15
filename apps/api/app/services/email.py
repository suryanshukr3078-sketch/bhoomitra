import logging
import smtplib
import socket
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from app.core.config import settings

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


def is_smtp_configured() -> bool:
    """Returns True if both SMTP username and password are provided."""
    return bool(settings.smtp_user and settings.smtp_password)


def get_smtp_status() -> dict[str, Any]:
    """Provides public diagnostic status without exposing sensitive credentials."""
    user = settings.smtp_user
    masked_user = None
    if user:
        if "@" in user:
            local, domain = user.split("@", 1)
            masked_user = f"{local[:2]}***@{domain}"
        else:
            masked_user = f"{user[:2]}***"

    effective_port = settings.smtp_port
    effective_ssl = bool(settings.smtp_ssl or effective_port == 465)
    effective_tls = bool(settings.smtp_tls and not effective_ssl)

    return {
        "configured": is_smtp_configured(),
        "host": settings.smtp_host,
        "port": effective_port,
        "protocol": "SSL" if effective_ssl else ("STARTTLS" if effective_tls else "PLAIN"),
        "from_email": settings.smtp_from_email or user or "support@bhoomitra.gov.in",
        "from_name": settings.smtp_from_name,
        "user_masked": masked_user,
    }


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
) -> EmailDeliveryResult:
    """
    Sends an email using standard SMTP with automatic protocol detection and Gmail failover.
    If SMTP credentials are not configured, logs simulated delivery and returns a simulated result.
    Never raises an unhandled exception.
    """
    if not to_email:
        logger.warning("[EmailService] No recipient email specified.")
        return EmailDeliveryResult(
            success=False,
            status="failed",
            message="No recipient email specified.",
        )

    smtp_user = settings.smtp_user
    smtp_password = settings.smtp_password

    # If SMTP credentials are not configured, simulate email dispatch safely
    if not is_smtp_configured():
        logger.info(
            f"[EmailService] SMTP credentials not set (SMTP_USER/SMTP_PASSWORD). "
            f"Simulated welcome email delivery to: {to_email} (Subject: '{subject}')"
        )
        return EmailDeliveryResult(
            success=True,
            status="simulated",
            message="Simulated email delivery: SMTP_USER or SMTP_PASSWORD not configured on server.",
            details={"to": to_email, "subject": subject},
        )

    from_email = settings.smtp_from_email or smtp_user
    from_name = settings.smtp_from_name
    sender_header = f"{from_name} <{from_email}>" if from_name else from_email

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender_header
    msg["To"] = to_email

    if text_body:
        msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    msg_str = msg.as_string()

    host = settings.smtp_host
    port = settings.smtp_port
    use_ssl = bool(settings.smtp_ssl or port == 465)
    use_tls = bool(settings.smtp_tls and not use_ssl)

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
            return EmailDeliveryResult(
                success=True,
                status="sent",
                message=alt_message,
                details={"host": host, "port": alt_port, "failover_used": True},
            )
        else:
            final_message = alt_message if "Authentication Error" in alt_message else message
            logger.error(f"[EmailService] Both primary ({port}) and fallback ({alt_port}) failed. Reason: {final_message}")
            return EmailDeliveryResult(
                success=False,
                status="failed",
                message=final_message,
                details={"host": host, "ports_tested": [port, alt_port]},
            )

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
