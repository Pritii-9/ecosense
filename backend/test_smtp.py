"""
SMTP Connection Test Script
Run this to verify your email credentials are working.
Usage: python test_smtp.py
"""

import os
import smtplib
from dotenv import load_dotenv

load_dotenv()

def test_smtp():
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_username)

    print(f"SMTP Host: {smtp_host}")
    print(f"SMTP Port: {smtp_port}")
    print(f"SMTP Username: {smtp_username}")
    print(f"Use TLS: {use_tls}")
    print("-" * 50)

    if not smtp_username or not smtp_password:
        print("ERROR: SMTP_USERNAME or SMTP_PASSWORD not configured in .env")
        return

    try:
        print("Connecting to SMTP server...")
        with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
            server.ehlo()
            print("EHLO successful")
            
            if use_tls:
                print("Starting TLS...")
                server.starttls()
                server.ehlo()
                print("TLS started successfully")

            print("Attempting login...")
            server.login(smtp_username, smtp_password)
            print("SUCCESS: Login successful!")

            # Optional: Send a test email to yourself
            test_recipient = smtp_username
            test_subject = "EcoSense SMTP Test"
            test_body = "This is a test email from EcoSense. SMTP is working correctly!"
            
            msg = f"Subject: {test_subject}\n\n{test_body}"
            server.sendmail(from_email, test_recipient, msg)
            print(f"SUCCESS: Test email sent to {test_recipient}")

    except smtplib.SMTPAuthenticationError as e:
        print(f"FAILED: Authentication error - {e}")
        print("\nTROUBLESHOOTING:")
        print("1. Make sure you're using a Gmail App Password, NOT your regular Gmail password")
        print("2. Generate a new App Password at: https://myaccount.google.com/apppasswords")
        print("3. Make sure 2-Step Verification is enabled on your Google Account")
        print("4. Update SMTP_PASSWORD in backend/.env with the new App Password")
    except smtplib.SMTPConnectError as e:
        print(f"FAILED: Connection error - {e}")
        print("\nTROUBLESHOOTING:")
        print("1. Check your internet connection")
        print("2. Verify SMTP_HOST is correct (should be smtp.gmail.com for Gmail)")
        print("3. Check if your firewall is blocking port 587")
    except Exception as e:
        print(f"FAILED: {e}")
        print("\nTROUBLESHOOTING:")
        print("1. Check your .env configuration")
        print("2. Verify your internet connection")
        print("3. Check if your email provider allows SMTP access")

if __name__ == "__main__":
    test_smtp()