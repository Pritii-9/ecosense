import smtplib
from email.mime.text import MIMEText

from flask import current_app


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

    with smtplib.SMTP(smtp_host, smtp_port, timeout=60) as server:
        server.ehlo()
        if use_tls:
            server.starttls()
            server.ehlo()

        if smtp_username and smtp_password:
            server.login(smtp_username, smtp_password)

        server.send_message(message)
