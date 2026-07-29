import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.config import Config
from app.main import send_email_smtp

print("GMAIL_USER:", Config.GMAIL_USER)
print("GMAIL_APP_PASSWORD:", "*" * len(Config.GMAIL_APP_PASSWORD) if Config.GMAIL_APP_PASSWORD else "EMPTY")

test_recipient = "patilbhushan3544@gmail.com"
subject = "PatentMind AI — Diagnostic Test OTP"
body = "This is a diagnostic test email to verify Gmail SMTP dispatch."

print(f"Attempting SMTP dispatch to {test_recipient}...")
result = send_email_smtp(test_recipient, subject, body)
print("RESULT:", result)
