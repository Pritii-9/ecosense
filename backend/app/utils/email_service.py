import logging
import smtplib
from email.mime.text import MIMEText

from flask import current_app

logger = logging.getLogger(__name__)


def send_email(recipient: str, subject: str, html_body: str) -> None:
    smtp_host = current_app.config["SMTP_HOST"]
    smtp_username = current_app.config["SMTP_USERNAME"]
    smtp_password = current_app.config["SMTP_PASSWORD"]
    from_email = current_app.config["SMTP_FROM_EMAIL"]
    from_name = current_app.config["SMTP_FROM_NAME"]

    if not smtp_host or not from_email:
        raise RuntimeError(
            "SMTP is not configured. Please add SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, and SMTP_FROM_EMAIL to backend/.env."
        )

    message = MIMEText(html_body, "html")
    message["Subject"] = subject
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = recipient

    smtp_port = current_app.config["SMTP_PORT"]
    use_tls = current_app.config["SMTP_USE_TLS"]

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=60) as server:
            server.ehlo()
            if use_tls:
                server.starttls()
                server.ehlo()

            if smtp_username and smtp_password:
                server.login(smtp_username, smtp_password)

            server.send_message(message)
            logger.info(f"Email sent successfully to {recipient}")
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication failed for {recipient}: {e}")
        raise RuntimeError(
            f"Email authentication failed. Please check your SMTP credentials. Error: {e}"
        ) from e
    except smtplib.SMTPConnectError as e:
        logger.error(f"SMTP connection failed for {recipient}: {e}")
        raise RuntimeError(
            f"Could not connect to email server. Please check SMTP_HOST and SMTP_PORT. Error: {e}"
        ) from e
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error sending email to {recipient}: {e}")
        raise RuntimeError(f"Failed to send email. Error: {e}") from e
    except Exception as e:
        logger.error(f"Unexpected error sending email to {recipient}: {e}")
        raise RuntimeError(f"Failed to send email. Error: {e}") from e
